import Link from "next/link";

/** 版本号：从内测（邀请码发放）后开始计。
 *  v0.1 2026-08-17 观点互动首发
 *  v0.2 2026-08-18 通知系统 + 直接评论 + 修复
 *  v0.3 2026-08-19 人格测试改版 + 测试结果统计
 *  v1  2026-08-23 移动端全面改版（手机友好）+ 海棠诗社 + 后台管理 + 个人名片（大版本）
 *  以后每次版本更新在此追加，并把最新版号同步到 UserMenu 与页脚。 */
export const APP_VERSION = "1";

const RELEASES = [
  {
    version: "1",
    date: "2026-08-23",
    tag: "移动端全面改版 · 海棠诗社",
    news: [
      "移动端全面改版：手机友好界面，顶部栏（头像 / Logo / 随缘漫游）+ 底部五栏导航（首页 / 搜索 / 发布 / 聊一聊 / 消息），手机上不用再侧滑菜单也能走完整个站",
      "新首页：沉浸开屏 + 今日热议 / 我关注的双页签 + 每日一诗 + 热度榜，一屏看懂园中今日动静",
      "左侧抽屉式导航：逛园子（人物志 / 图谱 / 大观园 / 旅程 / 诗词）、海棠诗社（诗题 / 填字 / 飞花 / 佳作集）、一起玩（问一问 / 人格测试）、我的",
      "海棠诗社全新上线：当期诗题 + 填字 + 飞花接句 + 佳作集，官方题库每周自动轮换，人人可「我来出题」（诗题 / 填字 / 飞花均可）",
      "官方内容标识：官方发布的题目带「官方」小标签，与用户出题清晰区分",
      "明暗主题切换：桌面端右上角用户菜单与手机端抽屉均支持三态切换（浅色 / 深色 / 跟随系统），记住你的选择",
      "个人中心改版：头像与背景图支持上传，背景图新增 16:9 自主框选；个人名片分享卡——生成含昵称 / 头像 / 等级 / 个人空间二维码的名片，扫码直达，可保存分享",
      "新增全局搜索：问题、人物、社区内容一站式查找",
      "后台管理升级：操作日志（登录 / 注册 / 发帖 / 评论 / 审核 / 封禁 / 邀请码全记录）、按用户查看全部内容（可下架）、邀请码批量生成",
      "新手引导：新注册用户首次进入会有一轮功能走查，跟着提示认识各个板块",
    ],
    fixes: [
      "修复手机版图片偶发不显示（图片读取路径问题）",
      "修复用户主页头像被封面遮挡的问题",
      "修复「编辑资料」跳转 404（basePath 重复前缀）",
      "修复个人中心右上角下拉菜单被裁剪不可见",
      "修复上传的图片加载 404（补充图片读取服务）",
      "修复部分页面卡片间距与按钮错位问题",
    ],
  },
  {
    version: "0.3",
    date: "2026-08-19",
    tag: "人格测试改版",
    news: [
      "人格测试全面改版：24 道情境题、24 位候选人（新增贾政、王夫人、贾雨村、薛蟠、尤三姐、柳湘莲、迎春、惜春、元春、鸳鸯），覆盖更多辈分与身份",
      "人物分析升级：以「能量倾向 / 认知方式 / 决策方式 / 生活方式」四个维度呈现，全部依据原著（行为、对话、判词曲文），不套用任何外部人格标签",
      "测试结果统计上线：测完即可看到站内有多少人与你结果相同（真实数据），测试页顶部新增站内同好数据看板",
      "结果分享卡升级：生成带人物画像、站内统计数字和二维码的分享卡片，可保存图片分享",
    ],
    fixes: [],
  },
  {
    version: "0.2",
    date: "2026-08-18",
    tag: "通知与体验",
    news: [
      "站内通知上线：有人在你的问题下发起了新讨论、评论了你的帖子、回复了你的楼层，右上角铃铛红点提醒，通知中心可一键查看跳转",
      "帖子可直接评论：讨论区与帖子详情页新增评论框，评论后仍可继续盖楼互动",
      "讨论区按热度排序，高赞讨论更靠前",
    ],
    fixes: [
      "修复分享卡片文字过小、底纹不显示、内容贴顶等排版问题",
      "修复「登录后回复/评论」点击无效、登录后无法跳回原页面的问题",
      "修复已删除的帖子仍显示在社区列表的问题",
      "修复移动端偶发显示旧版本页面、社区无法发帖回复的问题",
    ],
  },
  {
    version: "0.1",
    date: "2026-08-17",
    tag: "观点互动首发",
    news: [
      "问题页观点点赞：可为红学家观点点赞，观点按点赞数动态排序",
      "引用观点发帖：把某家观点带进讨论区，写下自己的理解再发布",
      "卡片式分享：观点 / 帖子 / 评论可生成带二维码的精美文字卡片，保存图片分享",
      "评论对话式升级：在留言下直接回复（树形楼层）、评论点赞、评论分享",
      "社区上线：邀请制注册、发帖盖楼、图片上传、自建话题、自动审核",
      "人格测试（16 题 14 位人物）、54 位人物头像、全站导航统一",
    ],
    fixes: [],
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <p className="text-xs tracking-[0.3em] text-gold">ABOUT</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">关于红楼社</h1>

      <section className="mt-6 rounded-2xl bg-surface card-print card-print--identity p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-serif text-lg text-paper">
            红
          </span>
          <div>
            <p className="font-serif text-lg font-semibold text-ink">红楼社 · 一梦红楼</p>
            <p className="text-xs text-muted">
              《红楼梦》数字探索社区 · 当前版本 v{APP_VERSION}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-body">
          从一个人物、一个问题、一个地点进入《红楼梦》。这里呈现中立概述、多方观点与原文证据——
          所有人物、事件、关系内容均标注章节与原文依据，可逐条溯源。
          《红楼梦》前八十回与后四十回归属均作明确标注。众说纷纭，皆是一家之言，你的判断，才是最终的答案。
        </p>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          目前处于小范围体验测试阶段，采用邀请制注册。欢迎把发现的问题或建议反馈给我们。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
          <span className="h-4 w-1 rounded-full bg-primary" />
          版本更新
        </h2>
        <div className="mt-5 space-y-4">
          {RELEASES.map((r) => (
            <article key={r.version} className="rounded-2xl bg-surface card-print card-print--viewpoints p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-[11px] tracking-wider text-primary">
                  v{r.version}
                </span>
                <span className="rounded-[4px] bg-gold/15 px-2 py-0.5 text-xs text-secondary-btn-text">
                  {r.tag}
                </span>
                <span className="text-xs text-muted">{r.date}</span>
              </div>
              {r.news.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {r.news.map((n, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-body">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              )}
              {r.fixes.length > 0 && (
                <>
                  <p className="mt-4 text-xs font-semibold tracking-wide text-gold">问题修复</p>
                  <ul className="mt-2 space-y-1.5">
                    {r.fixes.map((f, i) => (
                      <li key={i} className="flex gap-2 text-sm leading-relaxed text-body">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </article>
          ))}
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-muted/70">
        <Link href="/" className="hover:text-primary">返回首页</Link>
        {" · "}© 2026 红楼社
      </p>
    </div>
  );
}
