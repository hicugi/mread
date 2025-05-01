import 'package:http/http.dart' as http;
import 'dart:io';
import './general.dart';

const String ADDRESS_URL = 'http://mread.webmaho.com/api/current';

class MyHtml {
  static Future<File> getHostFile() async {
    Directory main = await General.getLocaleDir();
    return File("${main.path}/addr");
  }

  static Future<String> getHost() async {
    File fileHost = await getHostFile();
    return fileHost.readAsStringSync();
  }

  static Future<File> getHtmlFile() async {
    Directory main = await General.getLocaleDir();
    return File("${main.path}/index.html");
  }

  static Future<String> getHtml(String host) async {
    File fileHtml = await getHtmlFile();

    if (fileHtml.existsSync()) {
      General.innerDebug("HTML template: Reading from cache");
      return fileHtml.readAsStringSync();
    }

    await syncHtmlTemplate();

    File fileRes = await getHtmlFile();
    return fileRes.readAsStringSync();
  }

  static Future<bool> downloadHtml(String url, String filePath) async {
    File file = File(filePath);

    General.innerDebug("Downloading html $filePath from $url");

    await http.get(Uri.parse(url)).then((response) {
      return file.writeAsString(response.body);
    });

    return true;
  }

  static Future<void> syncHtmlTemplate() async {
    File hostFile = await getHostFile();
    File htmlFile = await getHtmlFile();

    General.innerDebug("Syncing html template");

    await http.get(Uri.parse(ADDRESS_URL)).then((response) async {
      String host = response.body;
      hostFile.writeAsString(host);

      General.innerDebug("Updating cache for HTML $host");

      await downloadHtml("$host/template.html", htmlFile.path);
    });
  }
}
