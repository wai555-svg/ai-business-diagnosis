// クライアントに公開してよい環境変数はここに集約する。
// NEXT_PUBLIC_ プレフィックスの変数は、ここでリテラルにアクセスすることで
// Next.jsのビルド時にクライアントバンドルへ埋め込まれる。
// 値が未設定の場合は空文字を返し、各コンポーネント側で「機能を読み込まない」判断に使う。

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

export const isGaEnabled = GA_MEASUREMENT_ID.length > 0;
export const isMetaPixelEnabled = META_PIXEL_ID.length > 0;
