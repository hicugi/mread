import 'dart:io';
import './general.dart';

const String MANGA_DIR = "manga";
const String MANGA_INFO = "-meta";
const String MANGA_COVER = "-cover.jpg";
const String MANGA_SAVE = "-save";
const String MANGA_INFO_CACHE = "-cache";
const String MANGA_DETAILS_CACHE = "-cache-details";

class Manga {
  static Future<Directory> getMangaDir() async {
    Directory main = await General.getLocaleDir();
    var result = Directory("${main.path}/$MANGA_DIR");

    var isExist = await result.exists();
    if (!isExist) {
      result.createSync(recursive: true);
    }

    return result;
  }

  static Future<dynamic> getMangaInfo(String alias) async {
    Directory mangaDir = await getMangaDir();
    Directory manga = Directory("${mangaDir.path}/$alias");

    if (!manga.existsSync()) return;

    String? name = await General.readFile("manga/$alias/$MANGA_INFO");
    if (name == null) return;

    String image = await General.getImageBase64("${manga.path}/$MANGA_COVER");
    String currentChapter = await Manga.getLastReadedChapter(alias);

    return {
      "mangaDir": manga,
      "name": name,
      "image": image,
      "currentChapter": currentChapter,
    };
  }

  static Future<void> syncMangaInfo(String alias, void Function(String, String) jsRun) async {
    var info = await getMangaInfo(alias);

    if (info == null) {
      General.innerDebug("Manga.syncMangaInfo: $alias not found in device");
      return;
    }

    String fnName = "appSyncMangaInfo";
    String cacheFilePath = "$MANGA_DIR/$alias/$MANGA_DETAILS_CACHE";

    var cacheContent = await General.readFile(cacheFilePath);
    if (cacheContent is String) {
      jsRun(fnName, cacheContent);
      return;
    }

    Iterable chapters = General.getDirSortedItems(info['mangaDir'].listSync().whereType<Directory>());

    List<String> jsData = [];

    for (var i = 0; i < chapters.length; i++) {
      var chapter = chapters.elementAt(i);

      String chapterName = chapter['alias'];
      var chapterInfo = await Manga.getChapterDetails(alias, chapterName);

      jsData.add("{ name: '$chapterName', itemsCount: ${chapterInfo['count']}, isDownloaded: true }");
    }

    String content = "{ alias: '$alias', name: '" + info['name'] + "', currentChapter: '" + info['currentChapter'] + "', chapters: [ ${jsData.join(',')} ], image: '" + info['image'] + "' }";

    General.writeFile(cacheFilePath, content);
    jsRun(fnName, content);
  }

  static Future<String?> getLastReadManga() async {
    Directory mangaDir = await getMangaDir();
    File saveFile = File("${mangaDir.path}/$MANGA_SAVE");

    if (saveFile.existsSync()) {
      String chapter = await saveFile.readAsString();
      return chapter;
    }
  }
  static Future<String> getLastReadedChapter(String alias) async {
    Directory mangaDir = await getMangaDir();
    File saveFile = File("${mangaDir.path}/$alias/$MANGA_SAVE");

    if (saveFile.existsSync()) {
      String chapter = await saveFile.readAsString();
      return chapter;
    }

    return "";
  }
  static saveLastReadedChapter(String alias, String chapter) async {
    Directory listDir = await getMangaDir();
    Directory mangaDir = await Directory("${listDir.path}/$alias");

    if (!mangaDir.existsSync()) {
      mangaDir.createSync(recursive: true);
    }

    File saveFile = File("${mangaDir.path}/$MANGA_SAVE");

    if (!saveFile.existsSync()) {
      saveFile.create();
    }

    saveFile.writeAsStringSync(chapter);
    General.innerDebug("Last readed chapter saved $chapter");

    File lastReadManga = File("${listDir.path}/$MANGA_SAVE");

    if (!lastReadManga.existsSync()) {
      saveFile.create();
    }

    lastReadManga.writeAsStringSync("$alias");
  }

  static Future<Map<String, dynamic>> getChapterDetails(String name, String chapter) async {
    Directory mangaDir = await getMangaDir();

    var path = "${mangaDir.path}/$name/$chapter";
    Directory chapterDir = Directory(path);

    var count = chapterDir.listSync().length;

    return {
      'path': path,
      'count': count,
    };
  }

  static downloadMangaInfo(String alias, String name, String url) async {
      Directory mangaDir = await getMangaDir();

      General.innerDebug("$alias $name $url ${mangaDir.path}");

      Directory manga = Directory("${mangaDir.path}/$alias");
      if (!manga.existsSync()) {
        manga.createSync(recursive: true);
      }

      File nameFile = File("${manga.path}/$MANGA_INFO");
      nameFile.writeAsStringSync(name);

      File imageFile = File("${manga.path}/$MANGA_COVER");
      if (!imageFile.existsSync()) {
        await General.downloadImage(url, "${manga.path}/$MANGA_COVER");
      }
  }

  static runScriptForMangaList(void Function(String, String) jsRun) async {
      Directory mangaDir = await getMangaDir();

      jsRun("appClearMangaList", "");

      String? lastReadManga = await getLastReadManga();

      mangaDir.listSync().forEach((manga) async {
        String alias = manga.path.split("/").last;
        runScriptInsertingManga(alias, jsRun);
      });
  }
  static runScriptInsertingManga(String alias, void Function(String, String) jsRun) async {
      String cacheFilePath = "$MANGA_DIR/$alias/$MANGA_INFO_CACHE";

      var cacheContent = await General.readFile(cacheFilePath);
      if (cacheContent is String) {
        jsRun("appInsertManga", cacheContent);
        return;
      }

      var info = await getMangaInfo(alias);

      if (info == null) return;

      String content = "{ alias: '$alias', name: '" + info['name'] + "', currentChapter: '" + info['currentChapter'] + "', image: `" + info['image'] + "` }";

      General.writeFile(cacheFilePath, content);
      jsRun("appInsertManga", content);
  }

  static insertChapter(String alias, String chapter, String url, int imagesCount) async {
      Directory dir = await General.createDir("$MANGA_DIR/$alias/$chapter");

      for (var i=0; i < imagesCount; i++) {
        int idx = i + 1;
        await General.downloadImage("${url}manga/$alias/$chapter/$i", "${dir.path}/$idx");
      }
  }

  static runScriptForInsertingImgs(String alias, String chapter, callback) async {
    Directory mangaDir = await Manga.getMangaDir();
    Directory chapterDir = Directory("${mangaDir.path}/$alias/$chapter");

    Iterable items = General.getDirSortedItems(chapterDir
        .listSync()
        .where((element) => element.path.split('/').last != 'done'));

    for (var i = 0; i < items.length; i++) {
      var item = items.elementAt(i);
      var image = item['dir'];

      String imageBase64 = await General.getImageBase64(image.path);

      callback("appInsertImage('$alias', '$chapter', '$imageBase64')");
    }
  }
}
