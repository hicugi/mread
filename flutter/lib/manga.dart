import 'dart:io';
import './general.dart';

const String MANGA_INFO = "-meta";
const String MANGA_COVER = "-cover.jpg";
const String MANGA_SAVE = "-save";

class Manga {
  static Future<Directory> getMangaDir() async {
    Directory main = await General.getLocaleDir();
    var result = Directory("${main.path}/manga");

    var isExist = await result.exists();
    if (!isExist) {
      result.createSync(recursive: true);
    }

    return result;
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
      return;
    }

    File saveFile = File("${mangaDir.path}/$MANGA_SAVE");

    if (!saveFile.existsSync()) {
      saveFile.create();
    }

    saveFile.writeAsStringSync(chapter);
    General.innerDebug("Last readed chapter saved $chapter");
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

      await General.downloadImage(url, "${manga.path}/$MANGA_COVER");
  }

  static runScriptForMangaList(callback) async {
      Directory mangaDir = await getMangaDir();

      callback("flSyncMangaList([]);");

      mangaDir.listSync().forEach((manga) async {
        String alias = manga.path.split("/").last;
        String image = await General.getImageBase64("${manga.path}/$MANGA_COVER");

        File nameFile = File("${manga.path}/$MANGA_INFO");
        String name = nameFile.readAsStringSync();

        General.innerDebug("Inserting locale manga: $alias $name");

        String savedChapter = await getLastReadedChapter(name);
        if (savedChapter != "") {
          savedChapter = ", currentChapter: '$savedChapter'";
        }

        String insertData = "{ name: '$name', alias: '$alias', image: '$image'$savedChapter }";
        General.innerDebug(insertData);

        callback("flInsertManga($insertData);");
      });
  }

  static runScriptForInsertingImgs(String name, String chapter, callback) async {
    Directory mangaDir = await Manga.getMangaDir();
    Directory chapterDir = Directory("${mangaDir.path}/$name/$chapter");

    // create save file
    saveLastReadedChapter(name, chapter);

    Iterable items = General.getDirSortedItems(chapterDir
        .listSync()
        .where((element) => element.path.split('/').last != 'done'));

    for (var i = 0; i < items.length; i++) {
      var item = items.elementAt(i);
      var image = item['dir'];

      String imageBase64 = await General.getImageBase64(image.path);

      callback(
        "flInsertImage('$imageBase64');",
      );
    }
  }
}
