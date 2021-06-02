require('dotenv').config();
const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
  const sessions = await fetchSlots();

  sessions.map((session) => {
    ctx.reply(`
    Pincode: ${session.pincode}
    District: ${session.district_name}
    Age Group: ${session.min_age_limit}+
    Center Name: ${session.name}
    Address: ${session.address}
    Date: ${session.date}
    Dose Available: ${session.available_capacity}
    Vaccine: ${session.vaccine}
    Fee: ${session.fee_type === 'Paid' ? session.fee : session.fee_type}`);
  });
});

const fetchSlots = async () => {
  let today = new Date();
  const dd = today.getDate().toString().padStart(2, '0');
  const mm = (today.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = today.getFullYear();
  today = `${dd}-${mm}-${yyyy}`;

  const { sessions } = await fetch(
    `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=411038&date=${today}`
  ).then((response) => response.json());
  return sessions;
};

bot.launch();
