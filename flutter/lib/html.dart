import 'package:http/http.dart' as http;
import 'dart:io';
import 'dart:async';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import './general.dart';

String hostUrl = 'http://127.0.0.1:8000/';
var isGetHtmlRunning = false;

class MyHtml {
  static Future<void> init() async {
    try {
      hostUrl = await getHost();
      General.innerDebug("MyHtml.init initial host $hostUrl from cache");
    } catch(_) {
      General.innerDebug("MyHtml.init initial host $hostUrl");
    }
  }

  static Future<File> getHostFile() async {
    return General.getFile("addr");
  }
  static Future<void> setHostFile(String host) async {
    General.innerDebug("[setHostFile] $host");

    File file = await getHostFile();
    file.writeAsString(host);

    hostUrl = host;
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

    if (isGetHtmlRunning) {
      while (isGetHtmlRunning) {
        await Future.delayed(const Duration(seconds: 1));
      }

      return fileHtml.readAsStringSync();
    }

    isGetHtmlRunning = true;

    if (fileHtml.existsSync()) {
      General.innerDebug("HTML template: Reading from cache");
      isGetHtmlRunning = false;

      return await fileHtml.readAsStringSync();
    }

    await syncHtmlTemplate();

    isGetHtmlRunning = false;

    return fileHtml.readAsStringSync();
  }

  static Future<bool> downloadHtml(String url) async {
    General.innerDebug("[downloadHtml] downloading html from $url");

    try {
      final response = await http.get(Uri.parse(url));

      File htmlFile = await getHtmlFile();
      await htmlFile.writeAsString(response.body);

      General.innerDebug("[downloadHtml] got template ${response.statusCode}");
    } catch(error) {
      await htmlForSettingHost();
      General.innerDebug("Error: $error");
    }

    return true;
  }

  static Future<void> htmlForSettingHost() async {
    try {
      File file = await getHtmlFile();

      await file.writeAsString('''<!DOCTYPE html><html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { height: 70vh; height: 70lvh; display: grid; align-items: center; }
            form { display: grid; gap: 20px; }
            input { padding: 0 10px; width: auto; height: 42px; line-height: 42px; font-size: 24px; }
            button { font-size: 24px; height: 46px; }
          </style>
        </head>
        <body>
          <div>
            <h1>Host not found</h1>
            <form>
              <input type="url" placeholder="http://127.0.0.1" />
              <button>submit</button>
            </form>
          </div>

          <script>
            const form = document.querySelector("form");
            const input = document.querySelector("input");

            form.addEventListener("submit", (e) => {
              e.preventDefault();

              const { value } = input;

              flUpdateHost.postMessage(value);
            });
          </script>
        </body></html>''');
    } catch (error) {
      General.innerDebug("Couldn't create html for for settingup host");
      General.innerDebug("Error: $error");
    }
  }

  static Future<void> syncHtmlTemplate() async {
    General.innerDebug("[syncHtmlTemplate] getting template from $hostUrl");

    try {
      await downloadHtml(hostUrl);
    } catch(error) {
      General.innerDebug("[syncHtmlTemplate] E Couldn't download from, settingup host form");
      await htmlForSettingHost();
    }
  }
}
