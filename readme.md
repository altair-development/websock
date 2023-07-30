# websock
WebSocket通信専用サーバーモジュール。ユーザーはログイン完了後に当該サーバーに直接アクセスし、自身の所属するクランチャンネルにログインしクランに関するデータの更新をサブスクライブする。

- Redisサーバー接続
- Redis Pub/Sub API
- APIサーバーとセッションを共有
- npm socket.ioライブラリ

## How to use
まず最初に下記のコマンドを実行しwebsockレポジトリをクローンします。  
※下記手順を実施する前に[altair/docker](https://github.com/altair-development/docker)のリソースを使ってRedisサーバーが起動していることを確認してください。
```
git clone https://github.com/altair-development/websock.git
```
次にwebsockフォルダに移動します。
```
cd websock
```
モジュールの実行に必要なnpmライブラリをインストールします。
```
npm ci
```
下記コマンドを実行し`.env.local`ファイルを`.env`のファイル名でコピーします。
```
COPY .env.local .env
```
`.env`ファイルを開き各種環境変数の値を設定します。

下記コマンドを実行しWebSocketサーバーを起動します。
```
set PODIP=127.0.0.1
node index
```
正常に実行できればコマンドラインに下記のようなメッセージが出力されます。
```
connect ioRedis
```
