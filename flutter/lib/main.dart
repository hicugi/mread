import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

// For downloading files
import 'package:path_provider/path_provider.dart';
import 'package:http/http.dart' as http;

// For the File type
import 'dart:io';
import 'dart:convert';
import 'dart:async';

// Local files
import './general.dart';
import './html.dart';
import './manga.dart';

final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();
final StreamController<NotificationResponse> selectNotificationStream =
    StreamController<NotificationResponse>.broadcast();

@pragma('vm:entry-point')
void notificationTapBackground(NotificationResponse notificationResponse) {
  // ignore: avoid_print
  print(
    'notification(${notificationResponse.id}) action tapped: '
    '${notificationResponse.actionId} with'
    ' payload: ${notificationResponse.payload}',
  );
  if (notificationResponse.input?.isNotEmpty ?? false) {
    // ignore: avoid_print
    print(
      'notification action tapped with input: ${notificationResponse.input}',
    );
  }
}

String host = '';
int notificationId = 0;

const chaptersSyncTimeout = Duration(milliseconds: 300);

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  const app = MyApp();
  runApp(app);
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    const home = MyWebView();

    return MaterialApp(
      title: 'MRead',
      theme: ThemeData(
        primarySwatch: Colors.blueGrey,
      ),
      home: home,
    );
  }
}

class MyWebView extends StatefulWidget {
  const MyWebView({super.key});

  @override
  _ParentWidgetState createState() => _ParentWidgetState();
}

class _ParentWidgetState extends State<MyWebView> {
  Future content = Future.value();

  @override
  void initState() {
    super.initState();

    General.innerDebug("ParentWidgetState init");
    MyHtml.init();
    content = MyHtml.getHtml(host);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
        future: content,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            return ChildWidget(htmlContent: snapshot.data);
          }

          const result =
              Scaffold(body: Center(child: CircularProgressIndicator()));
          return result;
        });
  }
}

class ChildWidget extends StatefulWidget {
  final htmlContent;

  ChildWidget({this.htmlContent});

  @override
  _MyWebViewState createState() => _MyWebViewState();
}

class _MyWebViewState extends State<ChildWidget> {
  late final WebViewController _controller;
  bool _isNotificationsWorking = false;

  String htmlContent = "";

  String downloadChaptersUrl = "";
  int downloadChaptersCountIdx = 3;
  List<List<dynamic>> downloadChaptersList = [];

  @override
  void initState() {
    super.initState();

    // #docregion platform_features
    late final PlatformWebViewControllerCreationParams params;
    params = const PlatformWebViewControllerCreationParams();

    final WebViewController controller =
        WebViewController.fromPlatformCreationParams(params);
    // #enddocregion platform_features

    controller
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))

      // Toaster
      ..addJavaScriptChannel(
        'Toaster',
        onMessageReceived: (JavaScriptMessage message) {
          _barMessage(message.message);
        },
      )

      // sync manga
      ..addJavaScriptChannel(
        'flIsApp',
        onMessageReceived: (JavaScriptMessage data) {},
      )

      // sync manga
      ..addJavaScriptChannel(
        'flUpdateHost',
        onMessageReceived: (JavaScriptMessage data) async {
          String host = data.message;
          if (host[host.length - 1] == "/") {
            host = host.substring(0, host.length - 1);
          }

          await MyHtml.setHostFile(host);
          await syncTemplate();
          _renderHtml(_controller);
        },
      )

      ..addJavaScriptChannel(
        'flFetchMangaList',
        onMessageReceived: (JavaScriptMessage data) async {
          String currentHost = await MyHtml.getHost();
          General.innerDebug("JS.flFetchMangaList Setting host in webview: $currentHost");
          _controller.runJavaScript("appSetHost('$currentHost');");
          await _insertMangaList();
        },
      )
      ..addJavaScriptChannel(
        'flFetchSaves',
        onMessageReceived: (JavaScriptMessage data) async {
          _syncLastReadManga();

          Directory listDir = await Manga.getMangaDir();

          listDir.listSync().forEach((manga) async {
            String alias = manga.path.split("/").last;
            String save = await Manga.getLastReadedChapter(alias);

            if (save == "") return;

            _jsRun("appSyncLastReadedChapter", "'$alias', '$save'");
          });
        },
      )

      ..addJavaScriptChannel('flDownloadManga',
          onMessageReceived: (JavaScriptMessage data) async {
        var [alias, name, url] = data.message.split("|");
        await Manga.downloadMangaInfo(alias, name, url);
        await Manga.runScriptInsertingManga(alias, _jsRun);
      })

      // select manga
      ..addJavaScriptChannel('flSelectManga',
          onMessageReceived: (JavaScriptMessage data) {
        Manga.syncMangaInfo(data.message, _jsRun);
      })

      // read chapter
      ..addJavaScriptChannel('flSynchChapterSave',
          onMessageReceived: (JavaScriptMessage data) async {
        var [name, chapter] = data.message.split('|');

        await Manga.saveLastReadedChapter(name, chapter);

        _syncLastReadManga();
      })
      ..addJavaScriptChannel('flInsertImgsFromChapter',
          onMessageReceived: (JavaScriptMessage data) async {
        var [name, chapter] = data.message.split('|');
        Manga.runScriptForInsertingImgs(name, chapter, _controller.runJavaScript);
      })

      ..addJavaScriptChannel(
        'flDownloadChapters',
        onMessageReceived: (JavaScriptMessage data) async {
          var list = data.message.split("|");

          if (list[0] == "chapter") {
            List<dynamic> info = downloadChaptersList.firstWhere((elm) => elm[0] == list[1]);

            String preUrl = downloadChaptersUrl;
            var [alias, name, chaptersLen, _] = info;
            String chapter = list[2];

            List<String> images = list.sublist(3);

            Directory mangaDir = await Manga.getMangaDir();

            String chapterPath = "${mangaDir.path}/$alias/$chapter";
            Directory chapterDir = Directory(chapterPath);

            if (!chapterDir.existsSync()) {
              chapterDir.createSync(recursive: true);
            }

            Future<void>.delayed(const Duration(milliseconds: 100), () async {
              for (var i=0; i < images.length; i++) {
                int idx = i + 1;
                String url = images[i];

                await General.downloadImage("${preUrl}manga/$alias/$url", "$chapterPath/$idx");
              }
            }).then((void _) {
              info[downloadChaptersCountIdx]++;
              _jsRun("appSyncDownloadedChapter", "{ alias: '$alias', chapter: { name: '$chapter', itemsCount: ${images.length} } }");
            });
            return;
          }

          if (_isNotificationsWorking) {
            await _requestNotificationPolicyAccess();

            if (!_isNotificationsWorking) {
              _jsRun("appDownloadComplete", "");
              return;
            }
          }

          var [_, alias, name, chaptersCount, preUrl, image] = list;
          int chaptersLen = int.parse(chaptersCount);
          downloadChaptersUrl = preUrl;
          downloadChaptersList.add([alias, name, chaptersLen, 0]);

          General.innerDebug("FL.flDownloadChapters: starting downloading $alias $name $preUrl");

          String title = "$name";
          String description = "Downloading $chaptersLen chapters";
          String descriptionDone = "All $chaptersLen chapters downloaded";

          _sendProgressNotification(title, description, descriptionDone, chaptersLen as int, () {
            List<dynamic> info = downloadChaptersList.firstWhere((elm) => elm[0] == list[1]);
            return info[downloadChaptersCountIdx];
          }).then((_) {
            _jsRun("appDownloadComplete", "");
          });

          await Manga.downloadMangaInfo(alias, name, preUrl + image);
          return;
        },
      )
      ..addJavaScriptChannel(
        'flDownloadChapter',
        onMessageReceived: (JavaScriptMessage data) async {
          await _requestNotificationPolicyAccess();
          if (!_isNotificationsWorking) return;

          var payload = data.message.split(";");
          var [alias, name, image, chapter] = payload[0].split("|");

          await Manga.downloadMangaInfo(alias, name, image);

          var images = payload[1].split("|");
          var imagesLen = images.length;

          Directory mangaDir = await Manga.getMangaDir();

          String chapterPath = "${mangaDir.path}/$alias/$chapter";
          Directory chapterDir = Directory(chapterPath);
          if (!chapterDir.existsSync()) {
            chapterDir.createSync(recursive: true);
          }

          String title = "$name - $chapter";
          String description = "Downloading $imagesLen images";
          String descriptionDone = "All $imagesLen images downloaded";
          int downloadedCount = 0;

          _sendProgressNotification(title, description, descriptionDone, imagesLen, () {
            return downloadedCount;
          }).then((_) {
            _jsRun("appDownloadComplete", "");
          });

          for (var i=0; i < imagesLen; i++) {
            int idx = i + 1;
            String url = images[i];

            General.downloadImage(url, "$chapterPath/$idx").then((bool _) async {
              downloadedCount++;
            });
          }
        },
      )

      // reload
      ..addJavaScriptChannel(
        'flReload',
        onMessageReceived: (JavaScriptMessage data) async {
          _renderHtml(_controller);
        },
      )
      ..addJavaScriptChannel(
        'flFullReload',
        onMessageReceived: (JavaScriptMessage data) async {
          await syncTemplate();
          _renderHtml(_controller);
        },
      )

      // clear cache
      ..addJavaScriptChannel(
        'flRemoveAll',
        onMessageReceived: (JavaScriptMessage data) async {
          Directory parent = await Manga.getMangaDir();
          await parent.delete(recursive: true);

          await syncTemplate();
          _renderHtml(_controller);
        },
      )
      ..addJavaScriptChannel(
        'flClearCache',
        onMessageReceived: (JavaScriptMessage data) async {
          await syncTemplate();
          _renderHtml(_controller);
        },
      )

      ..addJavaScriptChannel(
        'flRemoveManga',
        onMessageReceived: (JavaScriptMessage data) async {
          Directory parent = await Manga.getMangaDir();
          Directory mangaDir = Directory("${parent.path}/${data.message}");
          await mangaDir.delete(recursive: true);

          await _insertMangaList();
        },
      )
      ..setNavigationDelegate(
          NavigationDelegate(onPageFinished: (String url) async {
            // Web page loaded
      }));
    ;
    // #enddocregion platform_features

    _controller = controller;

    General.innerDebug("Rendering on controller");
    _renderHtml(_controller);
  }

  Future<void> _setupNotifications() async {
    const AndroidInitializationSettings initializationSettingsAndroid =
      AndroidInitializationSettings('@mipmap/app_icon');

    // final List<DarwinNotificationCategory> darwinNotificationCategories =
    //     <DarwinNotificationCategory>[
    //       DarwinNotificationCategory(
    //         darwinNotificationCategoryText,
    //         actions: <DarwinNotificationAction>[
    //           DarwinNotificationAction.text(
    //             'text_1',
    //             'Action 1',
    //             buttonTitle: 'Send',
    //             placeholder: 'Placeholder',
    //           ),
    //         ],
    //       ),
    //       DarwinNotificationCategory(
    //         darwinNotificationCategoryPlain,
    //         actions: <DarwinNotificationAction>[
    //           DarwinNotificationAction.plain('id_1', 'Action 1'),
    //           DarwinNotificationAction.plain(
    //             'id_2',
    //             'Action 2 (destructive)',
    //             options: <DarwinNotificationActionOption>{
    //               DarwinNotificationActionOption.destructive,
    //             },
    //           ),
    //           DarwinNotificationAction.plain(
    //             navigationActionId,
    //             'Action 3 (foreground)',
    //             options: <DarwinNotificationActionOption>{
    //               DarwinNotificationActionOption.foreground,
    //             },
    //           ),
    //           DarwinNotificationAction.plain(
    //             'id_4',
    //             'Action 4 (auth required)',
    //             options: <DarwinNotificationActionOption>{
    //               DarwinNotificationActionOption.authenticationRequired,
    //             },
    //           ),
    //         ],
    //         options: <DarwinNotificationCategoryOption>{
    //           DarwinNotificationCategoryOption.hiddenPreviewShowTitle,
    //         },
    //       ),
    //     ];

    // final IOSInitializationSettings initializationSettingsIOS =
    //     IOSInitializationSettings(
    //       requestAlertPermission: false,
    //       requestBadgePermission: false,
    //       requestSoundPermission: false,
    //       notificationCategories: darwinNotificationCategories,
    //     );

    final InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
      // iOS: initializationSettingsIOS,
    );

    await flutterLocalNotificationsPlugin.initialize(
      settings: initializationSettings,
      onDidReceiveNotificationResponse: selectNotificationStream.add,
      onDidReceiveBackgroundNotificationResponse: notificationTapBackground,
    );

    final NotificationAppLaunchDetails? notificationAppLaunchDetails = await flutterLocalNotificationsPlugin.getNotificationAppLaunchDetails();
    // if (notificationAppLaunchDetails?.didNotificationLaunchApp ?? false) {
    //   selectedNotificationPayload = notificationAppLaunchDetails!.notificationResponse?.payload;
    // }

    _isNotificationsWorking = (notificationAppLaunchDetails?.didNotificationLaunchApp ?? false) != false;
  }
  Future<bool> _requestNotificationPolicyAccess() async {
    final AndroidFlutterLocalNotificationsPlugin? androidImplementation =
        flutterLocalNotificationsPlugin
            .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin
            >();

    final bool? grantedNotificationPermission = await androidImplementation
        ?.requestNotificationsPermission();

    if (grantedNotificationPermission ?? false) {
      _isNotificationsWorking = true;
      return true;
    }

    return false;
  }

  Future<void> _sendProgressNotification(String title, String description, String descriptionDone, int total, int Function() getProgress) async {
    notificationId++;
    final int progressId = notificationId;

    Future <void> call(title, description) async {
      await Future<void>.delayed(const Duration(seconds: 1), () async {
        final AndroidNotificationDetails androidNotificationDetails =
          AndroidNotificationDetails(
            title,
            title,
            channelDescription: description,
            channelShowBadge: false,
            importance: Importance.max,
            priority: Priority.high,
            onlyAlertOnce: true,
            showProgress: true,
            maxProgress: total,
            progress: getProgress(),
          );
        final NotificationDetails notificationDetails = NotificationDetails(
          android: androidNotificationDetails,
        );
        await flutterLocalNotificationsPlugin.show(
          id: progressId,
          title: title,
          body: description,
          notificationDetails: notificationDetails,
          payload: "item x",
        );
      });
    }

    while (getProgress() < total) {
      await call(title, description);
    }

    await call(title, descriptionDone);
  }

  _barMessage(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg)),
    );
  }

  Future<void> syncTemplate() async {
    await MyHtml.syncHtmlTemplate();
    host = await MyHtml.getHost();
  }

  Future<void> _renderHtml(controller) async {
    await Future.delayed(const Duration(seconds: 1));

    try {
      await _setupNotifications();
    } catch (error) {
      _barMessage("Setup notifications error: $error");
    }

    String content = await MyHtml.getHtml(host);
    final String htmlBase64 = base64Encode(
      const Utf8Encoder().convert(content),
    );

    controller.loadRequest(Uri.parse("data:text/html;base64,$htmlBase64"));
  }

  Future<void> _insertMangaList() async {
    await Manga.runScriptForMangaList(_jsRun);
  }
  Future<void> _syncLastReadManga() async {
    String? alias = await Manga.getLastReadManga();
    if (alias != null) {
      _jsRun("appSetLastReadManga", "'$alias'");
    }
  }

  void _jsRun(String fn, String attrs) {
    String value = "$fn($attrs)";

    General.innerDebug("_jsRun: $value");
    _controller.runJavaScript(value);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: WebViewWidget(controller: _controller),
    );
  }
}
