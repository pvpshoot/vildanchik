import {Markup, Telegraf}  from 'telegraf'
import * as R from 'ramda';

const CHAT_ID = '-4074726600';
const POOL_LIMIT = 10;

const bot = new Telegraf(process.env.BOT_TOKEN)

var groupsOf = R.curry(function group(n, list) {
    return R.isEmpty(list) ? [] : R.prepend(R.take(n, list), group(n, R.drop(n, list)));
});

const getTime = str => str.split(':').map(n => Number(n))
const makeTime = (h, m) => `${h}:${m}`;
const makeAnswers = (start, times) => {
    const [h, m] = start;
    return Array(times).fill(undefined).reduce((acc, cur, index) => {
        if(index === 0) {
            acc.push(makeTime(h, m === 0 ? '00' : m));
        } else {
            const prev = getTime(acc[index -1]);
            if(prev[1] === 30){
                acc.push(makeTime(prev[0] + 1 , '00'))
            } else {
                acc.push(makeTime(prev[0], '30'))
            }
        }
        
        return acc;
    }, [])
}

bot.on('chosen_inline_result', ctx => {
    const [t, c] = ctx.update.chosen_inline_result.query.split(' ');
        const count = Number(c);
        const time = getTime(t);

        const answers = makeAnswers(time, count);
        const chunks = groupsOf(POOL_LIMIT - 1, answers)

        chunks.forEach((chunk, i) => {
            const pools = [...chunk, 'просмотр']
            ctx.telegram.sendPoll(CHAT_ID, `Массажик? ${i + 1}/${chunks.length}`, pools, {
                is_anonymous: false,
            })
        });    
})
bot.on('inline_query', async (ctx) => {
    const query = ctx.update.inline_query.query;

    let time;
    let count;

    try {
        const [t, c] = query.split(' ');
        count = Number(c);

        time = getTime(t);

        if(!count) return


        const answers = makeAnswers(time, count);
    const result = [
        {
          type: 'article',
          id: '1',
          title: ' Создать опрос на массажик?',
          input_message_content: {
            message_text: `Создаю ${answers.length} слотов с ${answers[0]} по ${answers.slice(-1)}`,
          },
          description: `Создать ${count} слотов с ${answers[0]} до ${answers.slice(-1)}?`,
          reply_markup: Markup.inlineKeyboard([
            Markup.button.url('Ссылка', 'https://example.com'),
          ]),
        },
      ];
    
    // Explicit usage
    await ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result)
  
    // Using context shortcut
    // await ctx.answerInlineQuery(result)


    } catch(error) {
        console.log("query: ", query)
        console.error(error);
    }
  })

bot.launch();

console.log('LAUNCHED =)')