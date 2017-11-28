export const Ids = {
    HOW_TO_PLAY_INFORMATION: 'HOW_TO_PLAY_INFORMATION',

    ONE_PLAYER: 'string@one_player',
    TWO_PLAYERS: 'string@two_players',
    BEGINNER: 'string@beginner',
    NOVICE: 'string@novice',
    EXPERT: 'string@expert',

    LABEL_WINNER: 'LABEL_WINNER',
    LABEL_FALSE_START: 'LABEL_FALSE_START',
    LABEL_DRAW: 'LABEL_DRAW',
    LABEL_STRAIGHT_WINS: 'LABEL_STRAIGHT_WINS',
    LABEL_TOP_TIME: 'LABEL_TOP_TIME',

    CHARA_NAME_HANAMARU: 'CHARA_NAME_HANAMARU',
    CHARA_NAME_SHITAKE: 'CHARA_NAME_SHITAKE',
    CHARA_NAME_LITTLE_DAEMON: 'CHARA_NAME_LITTLE_DAEMON',
    CHARA_NAME_UCHICCHI: 'CHARA_NAME_UCHICCHI',
    CHARA_NAME_WATAAME: 'CHARA_NAME_WATAAME',
    CHARA_NAME_ENEMY_RUBY: 'CHARA_NAME_ENEMY_RUBY',

    CREDIT_T28: "CREDIT_T28",
    CREDIT_SANZASHI: "CREDIT_SANZASHI",
    CREDIT_ON_JIN: "CREDIT_ON_JIN",
    CREDIT_LOVELIVE: "CREDIT_LOVELIVE",

    GAME_RESULT_TWEET1: 'GAME_RESULT_TWEET1',
    GAME_RESULT_TWEET2: 'GAME_RESULT_TWEET2',
    GAME_RESULT_TWEET_COMPLETE: 'GAME_RESULT_TWEET_COMPLETE',
    GAME_RESULT_TWEET_ZERO_POINT: 'GAME_RESULT_TWEET_ZERO_POINT',
};

export default {
    en: {
        translation: {
            [Ids.HOW_TO_PLAY_INFORMATION]: `An oimo, sweet potato, has baked, zura!.
...No! Someone is coming close to take it!

It’s not going to work that way, zura!
Tap display or click any key immediately when you see "!".`,

            [Ids.ONE_PLAYER]: '1P',
            [Ids.TWO_PLAYERS]: '2P',

            [Ids.BEGINNER]: 'Beginner',
            [Ids.NOVICE]: 'Novice',
            [Ids.EXPERT]: 'Expert',

            [Ids.LABEL_WINNER]: 'Winner',
            [Ids.LABEL_FALSE_START]: 'False start',
            [Ids.LABEL_DRAW]: 'Tie',
            [Ids.LABEL_STRAIGHT_WINS]: 'straight wins',
            [Ids.LABEL_TOP_TIME]: 'Top time',

            [Ids.CHARA_NAME_HANAMARU]: 'Hanamaru',
            [Ids.CHARA_NAME_SHITAKE]: 'Shitake',
            [Ids.CHARA_NAME_LITTLE_DAEMON]: 'Little deamond',
            [Ids.CHARA_NAME_UCHICCHI]: 'Uchicchi',
            [Ids.CHARA_NAME_WATAAME]: 'Wataame',
            [Ids.CHARA_NAME_ENEMY_RUBY]: 'Ruby',

            [Ids.CREDIT_T28]: 'Planning, Program, Music: T28',
            [Ids.CREDIT_SANZASHI]: 'Illustration: Sanzashi',
            [Ids.CREDIT_ON_JIN]: 'Sound effect: On-Jin ～音人～',
            [Ids.CREDIT_LOVELIVE]: 'PROJECT Lovelive!',

            [Ids.GAME_RESULT_TWEET1]: `はなまる「おいも焼けたず、、、まるのおいもが！」ベストタイム {{bestTime}}、{{wins}}人抜き！`,
            [Ids.GAME_RESULT_TWEET2]: `???「はなまるちゃんのおいも、おいしいね。    うゆ。」 ベストタイム {{bestTime}}、{{wins}}人抜き！`,
            [Ids.GAME_RESULT_TWEET_COMPLETE]: `はなまる「素敵な人生(おいも)ずら〜」ベストタイム {{bestTime}}、{{wins}}人抜き！`,
            [Ids.GAME_RESULT_TWEET_ZERO_POINT]: `はなまる「もういいずら、ぴよこ万十食べるずら」{{wins}}人抜き、、、、`,
        }
    },
    ja: {
        translation: {
            [Ids.HOW_TO_PLAY_INFORMATION]: `おいもやけたずら〜！
...大変！まるのお芋を狙ってる子達が次々とやってくるずら！

そうはいかないずら！
"!"マークが現れたら、すかさずタップ、またはキーを押そう！`,

            [Ids.BEGINNER]: '易',
            [Ids.NOVICE]: '中',
            [Ids.EXPERT]: '難',

            [Ids.LABEL_WINNER]: '勝者',
            [Ids.LABEL_FALSE_START]: '仕切り直し',
            [Ids.LABEL_DRAW]: '仕切り直し',
            [Ids.LABEL_STRAIGHT_WINS]: '人ぬき',
            [Ids.LABEL_TOP_TIME]: '最速タイム',

            [Ids.CHARA_NAME_HANAMARU]: 'はなまる',
            [Ids.CHARA_NAME_SHITAKE]: 'しいたけ',
            [Ids.CHARA_NAME_LITTLE_DAEMON]: 'リトルデーモン',
            [Ids.CHARA_NAME_UCHICCHI]: 'うちっちー',
            [Ids.CHARA_NAME_WATAAME]: 'わたあめ',
            [Ids.CHARA_NAME_ENEMY_RUBY]: 'るびぃ',

            [Ids.CREDIT_T28]: '思いつき, プラグラム, 音楽: T28',
            [Ids.CREDIT_SANZASHI]: 'イラスト: さんざし',
            [Ids.CREDIT_ON_JIN]: '効果音: On-Jin ～音人～',
            [Ids.CREDIT_LOVELIVE]: 'プロジェクト ラブライブ！',
        }
    }
}
