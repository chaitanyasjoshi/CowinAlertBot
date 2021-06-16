require('dotenv').config();
const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');
const schedule = require('node-schedule');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
  ctx.reply('Enter your pincode');

  bot.hears(/^[1-9][0-9]{5}$/, async (ctx) => {
    const job = schedule.scheduleJob('*/6 * * * * *', async () => {
      const sessions = await fetchSlots(ctx.message.text);

      sessions.map((session) => {
        ctx.reply(
          `Pincode: ${session.pincode}, ${session.district_name}

Age Group: ${session.min_age_limit}+

Center Name: ${session.name}
Address: ${session.address}
Date: ${session.date}

Dose Available: ${session.available_capacity}

Vaccine: ${session.vaccine}
Fee: ${
            session.fee_type === 'Free' || session.fee === '0'
              ? 'Free'
              : '₹ ' + session.fee
          }`
        );
      });
    });
  });
});

const fetchSlots = async (pincode) => {
  let today = new Date();
  const dd = today.getDate().toString().padStart(2, '0');
  const mm = (today.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = today.getFullYear();
  today = `${dd}-${mm}-${yyyy}`;

  const { sessions } = await fetch(
    `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=${pincode}&date=${today}`
  ).then((response) => response.json());
  return sessions;
};

bot.launch();
