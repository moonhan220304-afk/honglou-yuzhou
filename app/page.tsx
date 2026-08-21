import Link from "next/link";
import ModuleCard from "@/components/module-card";
import CharacterCard from "@/components/character-card";
import PoemRotator from "@/components/poem-rotator";
import HomeView from "@/components/home-view";
import MHome from "@/components/mobile/m-home";
import { questions } from "@/lib/data";
import { communityPosts } from "@/lib/mock/relationships";
import { IS_MOBILE_BUILD } from "@/lib/mobile-build";

const hotCharacters = [
  { id: "character_lin_daiyu", name: "林黛玉", alias: "潇湘妃子" },
  { id: "character_jia_baoyu", name: "贾宝玉", alias: "怡红公子" },
  { id: "character_xue_baochai", name: "薛宝钗", alias: "蘅芜君" },
  { id: "character_wang_xifeng", name: "王熙凤", alias: "凤辣子" },
  { id: "character_jia_tanchun", name: "贾探春", alias: "蕉下客" },
  { id: "character_jiamu", name: "贾母", alias: "老祖宗" },
  { id: "character_shi_xiangyun", name: "史湘云", alias: "枕霞旧友" },
  { id: "character_miao_yu", name: "妙玉", alias: "槛外人" },
];

export default function Home() {
  if (IS_MOBILE_BUILD) return <MHome />;
  const hot = questions[0];
  const hotQuestion = hot
    ? {
        id: hot.id,
        title: hot.title,
        heat: hot.heat_weight,
        characterCount: hot.related_character_ids?.length ?? 0,
        eventCount: hot.related_event_ids?.length ?? 0,
        viewpoints: hot.viewpoints.map((v) => ({
          title: v.title,
          confidence: v.confidence,
        })),
        totalViewpoints: hot.viewpoints.length,
      }
    : null;

  return (
    <>
      <main className="relative z-10">
        <HomeView
          daiyuId="character_lin_daiyu"
          baoyuId="character_jia_baoyu"
          hotQuestion={hotQuestion}
        />

        {/* 纸色内容区 */}
        <div className="relative bg-paper pb-10">
          <section className="mx-auto max-w-6xl px-6 pt-16">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <ModuleCard
                title="人物宇宙"
                subtitle="十八份深度档案：身份、性格、时间线与命运"
                href="/characters"
                glyph="人"
              />
              <ModuleCard
                title="问题中心"
                subtitle="五十个红学之问：证据、观点、众说纷纭"
                href="/questions"
                glyph="问"
              />
              <ModuleCard
                title="探索路线"
                subtitle="四条叙事线，逐站前行，看懂一段命运"
                href="/journey"
                glyph="径"
              />
              <ModuleCard
                title="大观园地图"
                subtitle="十九个地点，谁住在这里，这里发生过什么"
                href="/map"
                glyph="园"
              />
            </div>
          </section>

          <section className="mx-auto mt-20 grid max-w-6xl gap-8 px-6 lg:grid-cols-2">
            <div>
              <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
                <span className="h-4 w-1 rounded-full bg-primary" />
                每日一诗
              </h2>
              <div className="mt-5">
                <PoemRotator />
              </div>
            </div>
            <div>
              <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
                <span className="h-4 w-1 rounded-full bg-primary" />
                今日热说
              </h2>
              <div className="mt-5 space-y-3">
                {communityPosts.map((post) => (
                  <Link
                    key={post.id}
                    href="/community"
                    className="block rounded-2xl bg-surface card-print card-print--identity p-5 transition-all hover:-translate-y-0.5 hover:shadow-hover"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded-[4px] bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {post.tag}
                      </span>
                      <span className="text-xs text-muted">{post.author}</span>
                    </div>
                    <h3 className="mt-2 font-serif text-[15px] font-semibold text-ink">
                      {post.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-1 text-sm text-muted">{post.excerpt}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted">
                      <span>赞 {post.votes}</span>
                      <span>评 {post.comments}</span>
                    </div>
                  </Link>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted/70">
                * 以上为示例内容，点击卡片前往社区讨论区，右上角「发帖」可参与真实讨论
              </p>
            </div>
          </section>

          <section className="mx-auto mt-20 max-w-6xl px-6">
            <div className="flex items-baseline justify-between">
              <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
                <span className="h-4 w-1 rounded-full bg-primary" />
                热门人物
              </h2>
              <Link href="/characters" className="text-xs font-medium text-primary">
                查看全部 →
              </Link>
            </div>
            <div className="mt-6 flex gap-8 overflow-x-auto pb-2">
              {hotCharacters.map((c) => (
                <CharacterCard key={c.id} id={c.id} name={c.name} alias={c.alias} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
