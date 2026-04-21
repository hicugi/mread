# MRead - manga reader

## Idea

An application that crawls multiple manga websites to collect and organize chapters, making them available for offline reading on Android and iOS devices.

## Motivation

Keeping up with manga across different websites can be tedious — jumping between sources, checking for new chapters, and remembering where you left off. This app brings everything into one place, allowing you to track, download, and read your favorite manga seamlessly.<br/>
The goal is simple: once you’ve added the manga you like, you can continue reading anytime, even without an internet connection. No extra steps, No distractions.

## Sections

### Manager

A server-side component responsible for managing manga sources. It allows adding new manga via links and metadata, automatically checking for available chapters, and downloading them in bulk.

[![Demo](media/manager-demo.gif)](media/manager-demo.mp4)

### API

A backend service that exposes the downloaded manga library through a structured API, enabling client applications to fetch manga lists, chapters, and updates efficiently.

### Template

A flexible layer used to manage and update the WebView content for both Android and iOS applications, ensuring a consistent reading experience across platforms.

### Flutter

A cross-platform application built with Flutter, providing a unified interface for Android and iOS. It supports development mode for testing and delivers a smooth, responsive reading experience.
