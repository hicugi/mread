import 'dart:io';
import './general.dart';

const String MANGA_INFO = "-meta";
const String MANGA_COVER = "-cover.jpg";

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

        String savedChapter = '';
        File saveFile = File("${manga.path}/save");

        if (saveFile.existsSync()) {
          String chapter = saveFile.readAsStringSync();
          savedChapter = ", currentChapter: '$chapter'";
        }

        String insertData = "{ name: '$name', alias: '$alias', image: '$image'$savedChapter }";
        General.innerDebug(insertData);

        callback("flInsertManga($insertData);");
      });
  }
}
