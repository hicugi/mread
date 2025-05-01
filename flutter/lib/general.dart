import 'package:flutter/foundation.dart';

// For downloading files
import 'package:path_provider/path_provider.dart';
import 'package:http/http.dart' as http;

// For the File type
import 'dart:io';
import 'dart:convert';

class General {
  static void innerDebug(String value) {
    debugPrint("===================== $value");
  }

  static Future<String> getImageBase64(String path) async {
    File imageFile = File(path);

    Uint8List imageBytes = await imageFile.readAsBytes();
    String imageBase64 = base64Encode(imageBytes);

    var stat = imageFile.statSync();
    return "data:${stat.type};base64, $imageBase64";
  }

  static Future<Directory> getLocaleDir() async {
    Directory main = await getApplicationDocumentsDirectory();
    return main;
  }

  static Iterable getDirSortedItems(dirItems) {
    Iterable result = dirItems.map((v) {
      String alias = v.path.split("/").last;

      RegExp exp = RegExp(r'(^\d+)');
      RegExpMatch? match = exp.firstMatch(alias);

      var n = double.parse(match![0]!);
      var n2 = alias.split('-');

      if (n2.length > 1) {
        n += double.parse(n2[1]) / 100000;
      }

      return {
        'dir': v,
        'alias': alias,
        'n': n,
      };
    });

    return result.toList()..sort((a, b) => a['n'].compareTo(b['n']));
  }

  static Future<bool> downloadImage(String url, String filePath) async {
    File file = File(filePath);

    await http.get(Uri.parse(url)).then((response) {
      if (file.existsSync()) {
        if (file.lengthSync() == response.bodyBytes.length) {
          innerDebug(
              "File already exists: $filePath ${response.bodyBytes.length}");
          return;
        }
      }

      file.writeAsBytes(response.bodyBytes);
      innerDebug("Downloaded image: $filePath ${response.bodyBytes.length}");
    });

    return true;
  }
}
