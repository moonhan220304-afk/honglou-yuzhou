/**
 * 移动版构建标识：NEXT_PUBLIC_MOBILE=1 时启用移动版 UI（独立移动站 /honglou-yuzhou/m/）。
 * 移动版原则：无响应式断点依赖、无全屏 fixed 背景、固定移动单列布局，
 * 保证任何内核（含微信老内核）下都按手机尺寸正确显示。
 */
export const IS_MOBILE_BUILD = process.env.NEXT_PUBLIC_MOBILE === "1";
