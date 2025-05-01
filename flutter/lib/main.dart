import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

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

String host = '';

const chaptersSyncTimeout = Duration(milliseconds: 300);

void main() {
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
  Future htmlContent = Future.value();

  @override
  void initState() {
    super.initState();
    htmlContent = MyHtml.getHtml(host);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
        future: htmlContent,
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
  String htmlContent = "";
  num flSelectMangaLastId = 0;

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
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(message.message)),
          );
        },
      )

      // sync manga
      ..addJavaScriptChannel(
        'flFetchMangaList',
        onMessageReceived: (JavaScriptMessage data) async {
          General.innerDebug("Setting host in webview: $host");
          _controller.runJavaScript("flSetHost('$host');");
          await _insertMangaList();
        },
      )
      ..addJavaScriptChannel('flSyncManga',
          onMessageReceived: (JavaScriptMessage data) async {
        var [alias, name, url] = data.message.split("|");
        await Manga.downloadMangaInfo(alias, name, url);
        _insertMangaList();
      })

      // select manga
      ..addJavaScriptChannel('flSelectManga',
          onMessageReceived: (JavaScriptMessage data) {
        _syncChapters(data.message);
      })

      // read chapter
      ..addJavaScriptChannel('flInsertImgsFromChapter',
          onMessageReceived: (JavaScriptMessage data) async {
        var [name, chapter] = data.message.split("|");

        Directory mangaDir = await Manga.getMangaDir();
        Directory chapterDir = Directory("${mangaDir.path}/$name/$chapter");

        // create save file
        File saveFile = File("${mangaDir.path}/save");

        if (!saveFile.existsSync()) {
          saveFile.create();
        }

        saveFile.writeAsStringSync(chapter);
        General.innerDebug("Last readed chapter $chapter");

        Iterable items = General.getDirSortedItems(chapterDir
            .listSync()
            .where((element) => element.path.split('/').last != 'done'));

        for (var i = 0; i < items.length; i++) {
          var item = items.elementAt(i);
          var image = item['dir'];

          String imageBase64 = await General.getImageBase64(image.path);

          _controller.runJavaScript(
            "flInsertImage('$imageBase64');",
          );
        }
      })

      // download chapter
      ..addJavaScriptChannel(
        'flDownloadImage',
        onMessageReceived: (JavaScriptMessage data) async {
          var [url, name, chapter, fileName, imagesCount] =
              data.message.split("|");

          Directory mangaDir = await Manga.getMangaDir();

          String savedDir = "${mangaDir.path}/$name/$chapter";
          Directory(savedDir).createSync(recursive: true);

          // check if image is exist
          // if (!File("$savedDir/$fileName").existsSync()) {}
          await General.downloadImage(url, "$savedDir/$fileName");

          _controller.runJavaScript("flImageDownloaded();");

          var chapterInfo = await Manga.getChapterDetails(name, chapter);

          General.innerDebug(
              "Downloading image (${chapterInfo['count']}/$imagesCount) from $url");
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
    _renderHtml(_controller);
  }

  Future<void> syncTemplate() async {
    await MyHtml.syncHtmlTemplate();
    host = await MyHtml.getHost();
  }

  Future<void> _renderHtml(controller) async {
    String content = await MyHtml.getHtml(host);
    final String htmlBase64 = base64Encode(
      const Utf8Encoder().convert(content),
    );
    controller.loadRequest(Uri.parse("data:text/html;base64,$htmlBase64"));
  }

  Future<void> _insertMangaList() async {
    callback(String str) {
      General.innerDebug(str);
      _controller.runJavaScript(str);
    }
    await Manga.runScriptForMangaList(callback);
  }

  Future<void> _syncChapters(String name) async {
    flSelectMangaLastId = (flSelectMangaLastId + 1) % 255;
    num currentId = flSelectMangaLastId;

    await Future.delayed(chaptersSyncTimeout);

    if (currentId != flSelectMangaLastId) return;

    Directory mangaDir = await Manga.getMangaDir();
    Directory selMangaDir = Directory("${mangaDir.path}/$name");

    if (!selMangaDir.existsSync()) {
      return;
    }

    File saveFile = File("${mangaDir.path}/save");
    String lastReadedChapter = "";

    if (saveFile.existsSync()) {
      lastReadedChapter = saveFile.readAsStringSync();
    }

    General.innerDebug("Selected manga: $name");

    Iterable chapters = General.getDirSortedItems(selMangaDir.listSync().whereType<Directory>());

    List<String> jsData = [];

    for (var i = 0; i < chapters.length; i++) {
      var chapter = chapters.elementAt(i);

      String chapterName = chapter['alias'];
      var chapterInfo = await Manga.getChapterDetails(name, chapterName);

      String continueValue =
          lastReadedChapter == chapterName ? 'true' : 'false';

      jsData.add(
          "{ name: '$chapterName', itemsCount: ${chapterInfo['count']}, isDownloaded: true, isContinue: $continueValue }");
    }

    _controller.runJavaScript("flSyncChapters([${jsData.join(',')}]);");
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: WebViewWidget(controller: _controller),
    );
  }
}
