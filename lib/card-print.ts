/** 五模板卡片水印分配：同一幅园林线稿的五个裁剪模板。
 *  稳定序列（基于卡片下标），同类型多卡相邻不重复；语义默认模板由起点控制。 */
export const CARD_TEMPLATES = [
  "identity",
  "timeline",
  "relations",
  "viewpoints",
  "questions",
] as const;

export type CardTemplate = (typeof CARD_TEMPLATES)[number];

/** start: 序列起点模板下标（语义默认）。例：问题页 start=4 → 第一张 questions(E) 模板 */
export function cardPrintClass(seq: number, start: number = 0): string {
  return `card-print card-print--${CARD_TEMPLATES[(start + seq) % 5]}`;
}
