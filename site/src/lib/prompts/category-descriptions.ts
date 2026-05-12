import type { PromptCategory } from "./types";

/**
 * Per-category SEO copy for /prompts/category/[cat] pages.
 *
 * Why hand-authored: each category page used to render only a card grid +
 * generic site description, which Google flags as thin/duplicate content.
 * 80-120 words of category-specific prose moves these pages out of HCU
 * risk and gives them their own SERP intent.
 *
 * Each entry: { headline, body, tip } per locale. 'tip' is rendered as a
 * sidebar/callout, 'body' as the main intro paragraph.
 */
type Copy = { headline: string; body: string; tip: string };

export const CATEGORY_DESCRIPTIONS: Record<PromptCategory, Record<string, Copy>> = {
  coding: {
    en: {
      headline: "AI coding prompts that survive a strict tech-lead review",
      body: "Every coding prompt here is built around the same idea: the model is most useful when constrained, not when given creative latitude. Code review prompts that triage by severity. Debugging prompts that ask Socratic questions instead of writing fixes. The output is more useful when the model has explicit rules to push back against.",
      tip: "Pair these prompts with Claude Sonnet 4.6, Cursor, or GPT-5 for the best results. The structural rules in each prompt body matter more than the model choice.",
    },
    ja: {
      headline: "テックリードの厳しいレビューを生き残るAIコーディングプロンプト",
      body: "ここに集めたコーディングプロンプトは共通する設計思想がある — モデルは創造的余地を与えると劣化するが、制約を与えると鋭くなる。深刻度でトリアージするコードレビュープロンプト、コードを書く代わりにソクラテス的に問うデバッグプロンプト。明示的なルールに反発させることで出力品質が上がる。",
      tip: "Claude Sonnet 4.6・Cursor・GPT-5 と組み合わせると最大効果。プロンプト本文の構造ルールがモデル選択より重要。",
    },
    "zh-CN": {
      headline: "能在严格 Tech Lead 审查下幸存的 AI 编码提示词",
      body: "这里的每个编码提示词都基于同一思路: 给模型创造空间反而劣化输出, 给约束才能让它锋利。按严重度分级的代码审查、用苏格拉底式提问替代直接给出修复的调试提示词。让模型有明确规则去对抗, 输出会更可靠。",
      tip: "搭配 Claude Sonnet 4.6、Cursor 或 GPT-5 效果最佳。提示词正文的结构规则比模型选择更重要。",
    },
    "zh-TW": {
      headline: "能在嚴格 Tech Lead 審查下倖存的 AI 編碼提示詞",
      body: "這裡的每個編碼提示詞都基於同一思路: 給模型創造空間反而劣化輸出, 給約束才能讓它鋒利。按嚴重度分級的程式碼審查、用蘇格拉底式提問替代直接給出修復的除錯提示詞。讓模型有明確規則去對抗, 輸出會更可靠。",
      tip: "搭配 Claude Sonnet 4.6、Cursor 或 GPT-5 效果最佳。提示詞本文的結構規則比模型選擇更重要。",
    },
    ko: {
      headline: "엄격한 테크리드 리뷰를 통과하는 AI 코딩 프롬프트",
      body: "여기 모인 코딩 프롬프트들은 한 가지 설계 사상을 공유한다 — 모델은 창의적 여지를 줄 때 열화되고, 제약을 줄 때 날카로워진다. 심각도로 분류하는 코드 리뷰, 수정 코드 대신 소크라테스식으로 질문하는 디버깅 프롬프트. 모델에게 반발할 명시적 규칙을 주면 출력이 더 신뢰할 만해진다.",
      tip: "Claude Sonnet 4.6, Cursor 또는 GPT-5와 결합 시 최대 효과. 프롬프트 본문의 구조 규칙이 모델 선택보다 중요.",
    },
    es: {
      headline: "Prompts AI de coding que sobreviven a un tech lead estricto",
      body: "Cada prompt de coding aquí está construido sobre la misma idea: el modelo es más útil cuando está restringido, no cuando le das libertad creativa. Prompts de code review que triajan por severidad. Prompts de debugging que hacen preguntas socráticas en lugar de escribir el fix. El output es más útil cuando el modelo tiene reglas explícitas contra las que empujar.",
      tip: "Combina estos prompts con Claude Sonnet 4.6, Cursor o GPT-5 para los mejores resultados. Las reglas estructurales del prompt importan más que la elección del modelo.",
    },
  },
  writing: {
    en: {
      headline: "Writing prompts that cut filler instead of adding it",
      body: "Default LLM 'rewrite this' prompts inflate length and add corporate filler. Every writing prompt here does the opposite: enforces a target length, suppresses 'unlock', 'leverage', 'truly', and forces explicit decisions about tone and audience. The output is shorter than your input, with the message intact.",
      tip: "Set tone explicitly (warm / neutral / firm) and a target word count. Vague instructions like 'make it better' produce vague output.",
    },
    ja: {
      headline: "フィラーを足すのでなく削るための書き込みプロンプト",
      body: "デフォルトの「これを書き直して」は長さを膨らませてビジネス言い回しを足してしまう。本カテゴリのプロンプトはすべて逆方向 — 目標長を強制し、「解放」「活用」「真に」などのフィラーを抑制し、トーンと相手を明示的に決めさせる。出力は入力より短く、メッセージは保たれる。",
      tip: "トーン (warm / neutral / firm) と目標文字数を明示的に指定。「もっと良く」という曖昧な指示は曖昧な出力を生む。",
    },
    "zh-CN": {
      headline: "砍废话而非加废话的写作提示词",
      body: "默认的「帮我改写」提示词会让长度膨胀, 加进商务套话。本类目的每个写作提示词都反其道而行 — 强制目标长度, 抑制「解锁」、「赋能」、「真的」等填充词, 强制对语气和读者做出明确决策。输出比输入短, 信息保持完整。",
      tip: "明确设置语气 (warm / neutral / firm) 与目标字数。「写得更好」之类的模糊指令只会得到模糊输出。",
    },
    "zh-TW": {
      headline: "砍廢話而非加廢話的寫作提示詞",
      body: "預設的「幫我改寫」提示詞會讓長度膨脹, 加進商務套話。本類目的每個寫作提示詞都反其道而行 — 強制目標長度, 抑制「解鎖」、「賦能」、「真的」等填充詞, 強制對語氣和讀者做出明確決策。輸出比輸入短, 資訊保持完整。",
      tip: "明確設定語氣 (warm / neutral / firm) 與目標字數。「寫得更好」之類的模糊指令只會得到模糊輸出。",
    },
    ko: {
      headline: "필러를 더하지 않고 깎는 글쓰기 프롬프트",
      body: "기본 '이거 다시 써줘'는 길이를 늘리고 비즈니스 상투어를 추가한다. 본 카테고리의 글쓰기 프롬프트는 모두 반대 방향 — 목표 길이를 강제하고, '잠금 해제', '활용', '진정으로' 같은 필러를 억제하며, 톤과 독자에 대해 명시적 결정을 강제한다. 출력은 입력보다 짧고 메시지는 보존된다.",
      tip: "톤 (warm / neutral / firm)과 목표 단어 수를 명시 설정. '더 잘 써'와 같은 모호한 지시는 모호한 출력만 낳는다.",
    },
    es: {
      headline: "Prompts de escritura que cortan relleno en lugar de agregarlo",
      body: "Los prompts default 'reescribe esto' inflan el largo y agregan relleno corporativo. Todo prompt de escritura aquí hace lo opuesto: fuerza un largo objetivo, suprime 'desbloquear', 'aprovechar', 'verdaderamente', y fuerza decisiones explícitas sobre tono y audiencia. El output es más corto que tu input, con el mensaje intacto.",
      tip: "Configura el tono explícitamente (cálido / neutral / firme) y un conteo objetivo de palabras. Las instrucciones vagas como 'hazlo mejor' producen output vago.",
    },
  },
  design: {
    en: {
      headline: "Design prompts that break the AI 'looks generic' default",
      body: "Default Midjourney / DALL·E output converges on the same uncanny smoothness, dramatic key light, and 85mm bokeh. The prompts here break the convergence by specifying lens, light direction, and explicit anti-smoothing rules. Each prompt has working v6/v7 examples you can paste and modify.",
      tip: "Lock the seed once you find a face you like. Vary lens or light to get distinct compositions of the same character without re-rolling.",
    },
    ja: {
      headline: "AI画像のデフォルト「のっぺり感」を破るデザインプロンプト",
      body: "Midjourney / DALL·E のデフォルト出力は不気味の谷的なのっぺり感、ドラマチックなキーライト、85mmボケに収束する。本カテゴリのプロンプトはレンズ・光の方向・明示的なアンチスムージング規則を指定して収束を破る。各プロンプトに動作確認済みの v6/v7 例があり、貼って改変できる。",
      tip: "気に入った顔ができたらシードを固定。レンズや光だけを変えて、同じキャラクターの別構図を再ロールなしで得られる。",
    },
    "zh-CN": {
      headline: "打破 AI 默认「看起来都一样」的设计提示词",
      body: "Midjourney / DALL·E 的默认输出都收敛到同一种诡异谷光滑感、戏剧性主光、85mm 散景。本类目的提示词通过指定镜头、光线方向、明确的反美颜规则来打破收敛。每个提示词都有可工作的 v6/v7 示例, 可粘贴后修改。",
      tip: "找到喜欢的脸后锁定种子。仅改变镜头或光线即可得到同一角色的不同构图, 不必重抽。",
    },
    "zh-TW": {
      headline: "打破 AI 預設「看起來都一樣」的設計提示詞",
      body: "Midjourney / DALL·E 的預設輸出都收斂到同一種詭異谷光滑感、戲劇性主光、85mm 散景。本類目的提示詞透過指定鏡頭、光線方向、明確的反美顏規則來打破收斂。每個提示詞都有可運作的 v6/v7 範例, 可貼上後修改。",
      tip: "找到喜歡的臉後鎖定種子。僅改變鏡頭或光線即可得到同一角色的不同構圖, 不必重抽。",
    },
    ko: {
      headline: "AI의 '다 비슷해 보임' 기본을 깨는 디자인 프롬프트",
      body: "Midjourney / DALL·E 기본 출력은 같은 언캐니 밸리식 매끄러움, 드라마틱한 키 라이트, 85mm 보케로 수렴한다. 본 카테고리 프롬프트는 렌즈, 광선 방향, 명시적 반-스무딩 규칙을 지정해 수렴을 깬다. 각 프롬프트에 동작하는 v6/v7 예시가 있어 붙여넣고 수정할 수 있다.",
      tip: "마음에 드는 얼굴이 나오면 시드 잠금. 렌즈나 조명만 바꾸면 같은 캐릭터의 다른 구도를 재생성 없이 얻는다.",
    },
    es: {
      headline: "Prompts de diseño que rompen el default 'AI genérico'",
      body: "El output default de Midjourney / DALL·E converge en la misma suavidad uncanny, key light dramática y bokeh 85mm. Los prompts aquí rompen la convergencia especificando lente, dirección de luz y reglas explícitas anti-suavizado. Cada prompt tiene ejemplos funcionando en v6/v7 que puedes pegar y modificar.",
      tip: "Bloquea el seed una vez encuentres una cara que te guste. Varía lente o luz para conseguir composiciones distintas del mismo personaje sin re-tirar.",
    },
  },
  research: {
    en: {
      headline: "Research prompts that surface claims, not paraphrases",
      body: "Default 'summarize this' produces lossy paragraph summaries. The research prompts here extract structured claims — each tagged with evidence type, source page, and confidence — so you can scan a 50-page report in 60 seconds and know exactly what's data-backed vs. asserted. Pairs naturally with the user-interview-script prompt for the full discovery → synthesis loop.",
      tip: "Run each source individually first, then ask the model to compare the resulting tables in a second pass. Better quality than feeding all sources at once.",
    },
    ja: {
      headline: "言い換えではなく主張を表面化させるリサーチプロンプト",
      body: "デフォルトの「要約して」は損失の多い段落要約を生む。本カテゴリのリサーチプロンプトは構造化主張を抽出 — 各々に根拠の種類、出典ページ、信頼度を付与 — 50ページ報告書を60秒でスキャンし、データに支えられた箇所と単なる断定を即座に区別できる。ユーザーインタビュースクリプトとペアでディスカバリー → 統合のループを完成。",
      tip: "各出典を最初に個別通過、2回目で結果テーブルを比較依頼。すべての出典を一度に投入するより品質が高い。",
    },
    "zh-CN": {
      headline: "把主张挖出来而非改写一遍的研究提示词",
      body: "默认「帮我总结」会产生有损的段落摘要。本类目的研究提示词抽取结构化主张 — 每条标注证据类型、来源页码、信心度 — 让你 60 秒扫完 50 页报告, 立刻分清哪些有数据支撑、哪些只是断言。与用户访谈脚本提示词配套, 完成发现 → 合成的完整闭环。",
      tip: "先逐源单独跑一遍, 再让模型在第二轮对比生成的表格。比一次性喂入所有来源质量更高。",
    },
    "zh-TW": {
      headline: "把主張挖出來而非改寫一遍的研究提示詞",
      body: "預設「幫我總結」會產生有損的段落摘要。本類目的研究提示詞抽取結構化主張 — 每條標註證據類型、來源頁碼、信心度 — 讓你 60 秒掃完 50 頁報告, 立刻分清哪些有資料支撐、哪些只是斷言。與使用者訪談腳本提示詞配套, 完成發現 → 合成的完整閉環。",
      tip: "先逐源單獨跑一遍, 再讓模型在第二輪比對生成的表格。比一次性餵入所有來源品質更高。",
    },
    ko: {
      headline: "재진술이 아닌 주장을 표면화하는 리서치 프롬프트",
      body: "기본 '요약해줘'는 손실 많은 단락 요약을 생성한다. 본 카테고리의 리서치 프롬프트는 구조화 주장을 추출한다 — 각 항목에 근거 종류, 출처 페이지, 신뢰도를 부여 — 50페이지 보고서를 60초에 스캔하고 데이터 기반과 단순 단언을 즉시 구분할 수 있다. 사용자 인터뷰 스크립트와 쌍으로 디스커버리 → 종합 루프 완성.",
      tip: "먼저 각 출처를 개별 통과시키고, 두 번째 패스에서 결과 테이블을 비교 요청. 모든 출처를 한 번에 투입보다 품질이 좋음.",
    },
    es: {
      headline: "Prompts de investigación que sacan claims, no parafraseos",
      body: "El default 'resúmeme esto' produce resúmenes en prosa con pérdida. Los prompts de investigación aquí extraen claims estructurados — cada uno etiquetado con tipo de evidencia, página fuente y confianza — para que puedas escanear un reporte de 50 páginas en 60 segundos y saber exactamente qué está respaldado por datos vs. solo aserciones. Se empareja con el prompt de entrevista a usuarios para el ciclo completo descubrimiento → síntesis.",
      tip: "Corre cada fuente individualmente primero, luego pide al modelo comparar las tablas resultantes en un segundo pase. Mejor calidad que alimentar todas las fuentes juntas.",
    },
  },
  business: {
    en: {
      headline: "Business prompts that force decisions, not discussion",
      body: "Most AI-generated meeting agendas, weekly reviews, and decision frameworks default to bullet-list productivity theater that changes nothing about Monday morning. The business prompts here force named decisions, single priorities, and the uncomfortable 'should this even be a meeting' check at the top. They produce documents you'll act on, not file away.",
      tip: "Use the meeting-prep prompt before your next recurring meeting. Half the time the answer is 'cancel and send a written update'.",
    },
    ja: {
      headline: "議論ではなく意思決定を強制するビジネスプロンプト",
      body: "AI生成の会議アジェンダ・週次レビュー・意思決定フレームワークの大半は、月曜の朝を何も変えないブレットリスト風の生産性演劇に陥る。本カテゴリのビジネスプロンプトは名指しの決定、単一の優先順位、「そもそもこれは会議すべきか」の冒頭チェックを強制する。ファイルしまう書類でなく、実際に行動する書類を生成。",
      tip: "次の定例会議前に会議準備プロンプトを使う。半数は「キャンセルして書面更新を送る」が答え。",
    },
    "zh-CN": {
      headline: "强制做决定而非讨论的商业提示词",
      body: "AI 生成的会议议程、周回顾、决策框架多半会陷入「无法改变周一早晨」的项目符号生产力剧场。本类目的商业提示词强制点名决议、单一优先级、以及最尴尬的「这是否真的需要开会」顶部检查。产出的是你会实际执行的文档, 不是归档的。",
      tip: "在下次例会前用会议准备提示词跑一遍。一半的时候答案是「取消, 改发书面更新」。",
    },
    "zh-TW": {
      headline: "強制做決定而非討論的商業提示詞",
      body: "AI 生成的會議議程、週回顧、決策框架多半會陷入「無法改變週一早晨」的項目符號生產力劇場。本類目的商業提示詞強制點名決議、單一優先順序、以及最尷尬的「這是否真的需要開會」頂部檢查。產出的是你會實際執行的文件, 不是歸檔的。",
      tip: "在下次例會前用會議準備提示詞跑一遍。一半的時候答案是「取消, 改發書面更新」。",
    },
    ko: {
      headline: "토론이 아닌 결정을 강제하는 비즈니스 프롬프트",
      body: "AI가 만드는 회의 안건, 주간 회고, 의사결정 프레임워크 대부분은 월요일 아침을 바꾸지 못하는 글머리표 생산성 연극에 빠진다. 본 카테고리의 비즈니스 프롬프트는 명명된 결정, 단일 우선순위, 그리고 가장 불편한 '이게 회의여야 하나' 상단 체크를 강제한다. 보관할 문서가 아닌 실제로 행동할 문서를 생성한다.",
      tip: "다음 정기 회의 전 회의 준비 프롬프트를 실행. 절반은 답이 '취소하고 서면 업데이트 보내기'.",
    },
    es: {
      headline: "Prompts de negocios que fuerzan decisiones, no discusión",
      body: "La mayoría de agendas, weekly reviews y frameworks de decisión generados por AI caen en teatro de productividad con bullet lists que no cambian nada el lunes por la mañana. Los prompts de negocios aquí fuerzan decisiones nombradas, prioridades únicas y el incómodo check de '¿esto debería ser una reunión?' arriba. Producen documentos sobre los que actuarás, no que archivarás.",
      tip: "Usa el prompt de meeting-prep antes de tu próxima reunión recurrente. La mitad de las veces la respuesta es 'cancelar y mandar update escrito'.",
    },
  },
  marketing: {
    en: {
      headline: "Marketing prompts that produce testable A/B candidates",
      body: "Generic 'write me 6 ad headlines' produces six rewrites of the same idea — six candidates that win or lose together. The marketing prompts here force angle diversity (problem / outcome / identity / social proof / scarcity / comparison) so you ship six genuine A/B hypotheses from one paste, not six rewrites of one.",
      tip: "Run angle diversity through ChatGPT or Claude, then shortlist 3 angles for paid testing. Skip 'be more creative' — name the persuasive angle explicitly.",
    },
    ja: {
      headline: "テスト可能なA/B候補を生むマーケティング プロンプト",
      body: "「広告ヘッドライン6個」と聞いた時のデフォルト出力は同じアイデアの言い換え6個 — 揃って勝つか揃って負ける6候補。本カテゴリのマーケティング プロンプトは切り口の多様性(課題 / 成果 / 自己像 / 社会的証明 / 希少性 / 比較)を強制し、1ペーストで本物のA/B仮説6つを出荷できる。1個の言い換え6個ではなく。",
      tip: "ChatGPT または Claude で多様性を出した後、3つの切り口を有料テスト候補に絞る。「もっと創造的に」は禁句 — 説得切り口を明示的に名指す。",
    },
    "zh-CN": {
      headline: "产出可测试 A/B 候选的营销提示词",
      body: "默认「写 6 条广告标题」会产出同一思路的 6 次改写 — 一起赢或一起输的 6 个候选。本类目的营销提示词强制切角多样性(痛点 / 结果 / 身份 / 社会证明 / 稀缺 / 对比), 一次粘贴产出真正的 6 个 A/B 假设, 而非 1 个的 6 次改写。",
      tip: "用 ChatGPT 或 Claude 跑出多样性后, 把 3 个切角投入付费测试。别说「再创造一些」 — 直接命名说服角度。",
    },
    "zh-TW": {
      headline: "產出可測試 A/B 候選的行銷提示詞",
      body: "預設「寫 6 條廣告標題」會產出同一思路的 6 次改寫 — 一起贏或一起輸的 6 個候選。本類目的行銷提示詞強制切角多樣性(痛點 / 結果 / 身份 / 社會證明 / 稀缺 / 對比), 一次貼上產出真正的 6 個 A/B 假設, 而非 1 個的 6 次改寫。",
      tip: "用 ChatGPT 或 Claude 跑出多樣性後, 把 3 個切角投入付費測試。別說「再創造一些」 — 直接命名說服角度。",
    },
    ko: {
      headline: "테스트 가능한 A/B 후보를 생성하는 마케팅 프롬프트",
      body: "'광고 헤드라인 6개'의 기본 출력은 같은 아이디어의 6번 재작성 — 함께 이기거나 함께 지는 6개 후보. 본 카테고리의 마케팅 프롬프트는 각도 다양성(통증 / 결과 / 정체성 / 사회적 증거 / 희소성 / 비교)을 강제하여 한 번의 붙여넣기로 진짜 A/B 가설 6개를 출하한다. 1개의 6번 재작성이 아닌.",
      tip: "ChatGPT 또는 Claude로 다양성을 끌어낸 후 3개 각도를 유료 테스트 후보로 좁힌다. '더 창의적으로'는 금지 — 설득 각도를 명시적으로 명명.",
    },
    es: {
      headline: "Prompts de marketing que producen candidatos A/B testables",
      body: "El genérico 'escríbeme 6 titulares' produce seis reescrituras de la misma idea — seis candidatos que ganan o pierden juntos. Los prompts de marketing aquí fuerzan diversidad de ángulos (problema / resultado / identidad / prueba social / escasez / comparación) para que envíes seis hipótesis A/B genuinas de una pegada, no seis reescrituras de una.",
      tip: "Corre la diversidad de ángulos por ChatGPT o Claude, luego elige 3 ángulos para testing pagado. Salta 'sé más creativo' — nombra el ángulo persuasivo explícitamente.",
    },
  },
};
