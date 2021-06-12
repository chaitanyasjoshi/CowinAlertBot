require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const fetch = require('node-fetch');
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
  const pincodeOrDistrictKeyboard = Markup.keyboard([
    Markup.button.callback('Pincode', 'pincode'),
    Markup.button.callback('District', 'district'),
  ]);

  ctx.telegram.sendMessage(
    ctx.from.id,
    `Hi ${ctx.chat.first_name}! Do you want to search slots by pincode or district?`,
    pincodeOrDistrictKeyboard
  );

  bot.action('pincode', (ctx) => {
    ctx.reply('You have chosen to search by pincode');
  });
  bot.action('district', async (ctx) => {
    ctx.reply('You have chosen to search by district');
    const states = await fetchStates();

    const statesKeyboard = Markup.keyboard(
      states.map((state) =>
        Markup.button.callback(state.state_name, state.state_id)
      )
    );

    ctx.telegram.sendMessage(ctx.from.id, 'Select your state', statesKeyboard);
  });

  // const sessions = await fetchSlots();

  // sessions.map((session) => {
  //   ctx.reply(`
  //   Pincode: ${session.pincode}
  //   District: ${session.district_name}
  //   Age Group: ${session.min_age_limit}
  //   Center Name: ${session.name}
  //   Address: ${session.address}
  //   Date: ${session.date}
  //   Dose Available: ${session.available_capacity}
  //   Vaccine: ${session.vaccine}
  //   Fee: ${session.fee_type === 'Paid' ? session.fee : session.fee_type}`);
  // });
});

const fetchStates = async () => {
  const { states } = await fetch(
    'https://cdn-api.co-vin.in/api/v2/admin/location/states',
    {
      headers: {
        'User-Agent': 'chrome',
      },
    }
  ).then((response) => response.json());
  return states;
};

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
