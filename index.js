const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "secret";

const knex = require("knex")({
  client: "mysql2",
  connection: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: "test",
  },
  pool: { min: 0, max: 7 },
});

const { faker } = require("@faker-js/faker");
const { toNamespacedPath } = require("path");

const insertDummyData = async () => {
  await knex.schema.dropTableIfExists("users");
  await knex.schema.createTable("users", (table) => {
    table.increments("id");
    table.string("first_name", 50);
    table.string("last_name", 50);
    table.string("email_address", 100);
    table.string("duplicate_email_address", 100);
    table.string("phone_number", 15);
    table.string("password", 100);
    table.string("access_token", 100);
    table.string("referral_code", 100);
    table.decimal("wallet_balance", 15, 2);
    table.timestamp("created_at");
    table.timestamp("updated_at");
    table.unique("email_address");
    table.unique("referral_code");
    table.unique("access_token");
  });

  for (let j = 0; j < 100; j++) {
    let dummyData = [];
    for (let i = 0; i < 100; i++) {
      dummyData.push({
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        email_address: faker.internet.email(),
        duplicate_email_address: faker.internet.email(),
        password: faker.random.alphaNumeric(50),
        access_token: faker.random.alphaNumeric(50),
        referral_code: faker.random.alpha({ count: 10, casing: "upper" }),
        phone_number: faker.phone.number("234##########"),
        wallet_balance: faker.finance.amount(0, 10000, 2),
        created_at: faker.date.past(),
        updated_at: faker.date.past(),
      });
    }

    await knex("users")
      .insert(dummyData)
      .catch(() => {
        j--;
        console.log("oops, a duplicate");
      });

    console.log("inserting in batches, loop: ", j);
  }
  await knex.destroy();
};

insertDummyData().catch((error) => console.error(error));
