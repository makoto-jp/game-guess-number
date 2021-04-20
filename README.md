# 数字当てゲーム

ランダムに生成された数字を当てるゲームです。
数字の桁数と基数(10進数とか16進数とか)はゲーム毎に異なります。


## 初め方

### 1. ゲーム一覧を取得する

ゲーム毎に数字の桁数と基数が異なります。
ゲームの一覧から各ゲームの詳細を確認できます。

```
GET /games


[
  {
    "id": "d1r10",
    "name": "1桁10進数",
    "num_digits": 1,
    "radix": 10
  },
  {
    "id": "d4r10",
    "name": "1桁10進数",
    "num_digits": 4,
    "radix": 10
  },
  {
    "id": "d4r16",
    "name": "1桁10進数",
    "num_digits": 4,
    "radix": 16
  }
]
```
各ゲームの `id` プロパティはゲームの開始に必要になります。

### ゲームを開始する

```
POST /sessions
{
  "game_id": "遊びたいゲームのid"
}
```

でゲームを開始。成功すると

```
{
  "session_id": {unique_session_id},
  "num_digits": 桁数,
  "radix": 基数,
  "status": {
    "code": 0,
    "text" "in progress"
  },
  "reply": {
    A: 0,
    B: 0
  }
}
```
のようなレスポンスが返ってきます。 `session_id` はゲームの進行に必要なので忘れないように。
`reply` プロパティについて後述します。

### 数字を推測する

ゲームを開始後は

```
PUT /sessions/:session_id/guess
{
  numbers: [ 1, 2, 3, 4 ]
}
```

のように推測した数字を `numbers` としてサーバに送信します。
サーバは推測された数字に対する回答を `reply` オブジェクトとして返します。

```
{
  "session_id": {unique_session_id},
  "num_digits": 桁数,
  "radix": 基数,
  "status": {
    "code": 0,
    "text": "in progress"
  },
  "reply": {
    A: 1,
    B: 1
  }
}
```
`reply.A` は推測した数字の内、数値と桁の位置があっている数字の個数です。  
`reply.B` は推測した数字の内、数値は存在するが桁が間違っている数字の数です。  

正しい数字を推測した時は `reply.A` の値が `num_digits` と同じになります。
また `status.code` が 1 になるのでそちらで判定可能です。

ゲームセッションは正しい数字を当てるか、セッション開始から1分経つと削除されます。
