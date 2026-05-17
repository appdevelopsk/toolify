// AdSenseスクリプトは layout.tsx の <head> 内で直接読み込むため、このコンポーネントは何も出力しない。
// Google確認クローラーは <head> 内のスクリプトのみ検索するため body 末尾では検出不可。
export function AdScript() {
  return null;
}
