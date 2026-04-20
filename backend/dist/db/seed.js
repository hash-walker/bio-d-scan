"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Seeds the PostgreSQL database with initial farmer and marketplace data.
 * Run once: `npm run seed`
 */
const postgres_1 = require("./postgres");
const logger_1 = require("../lib/logger");
require("dotenv/config");
const log = (0, logger_1.createLogger)("seed");
const FARMERS = [
    {
        name: "Ahmed Khan",
        farm_name: "Green Valley Orchards",
        phone: "+92 300 1234567",
        location: "Veridian Valley Reserve, Punjab",
        lat: 31.5497,
        lng: 74.3436,
        field_area_ha: 24.5,
        farming_method: "organic",
        water_source: "rainFed",
        primary_crops: "Wheat, Sunflower",
        carbon_credits: 1284,
        weather: { temp: 24, humidity: 62, condition: "Partly Cloudy" },
    },
    {
        name: "Sara Malik",
        farm_name: "Sunrise Fields",
        phone: "+92 300 2345678",
        location: "Amber Wetlands, Sindh",
        lat: 25.396,
        lng: 68.3578,
        field_area_ha: 16.0,
        farming_method: "transitioning",
        water_source: "irrigated",
        primary_crops: "Rice, Cotton",
        carbon_credits: 640,
        weather: { temp: 29, humidity: 55, condition: "Sunny" },
    },
    {
        name: "Bilal Raza",
        farm_name: "Highland Fern Estate",
        phone: "+92 300 3456789",
        location: "Highland Ferns, KPK",
        lat: 34.0151,
        lng: 71.5249,
        field_area_ha: 31.2,
        farming_method: "commercial",
        water_source: "mixed",
        primary_crops: "Corn, Barley",
        carbon_credits: 120,
        weather: { temp: 18, humidity: 78, condition: "Overcast" },
    },
    {
        name: "Nadia Hussain",
        farm_name: "River Bend Farms",
        phone: "+92 300 4567890",
        location: "Northern Corridor, Gilgit",
        lat: 35.9208,
        lng: 74.3087,
        field_area_ha: 9.8,
        farming_method: "organic",
        water_source: "rainFed",
        primary_crops: "Apple, Cherry",
        carbon_credits: 890,
        weather: { temp: 14, humidity: 70, condition: "Fog" },
    },
];
const MARKETPLACE_ITEMS = [
    { name: "Bio-Regen Fertilizer", description: "Enhanced microbial liquid formula for deep root sequestration.", credit_cost: 450, category: "fertilizer", icon_name: "Sprout" },
    { name: "Heritage Seed Pack", description: "Ancient variety grains resistant to drought and high salinity.", credit_cost: 120, category: "seeds", icon_name: "Flower2" },
    { name: "IoT Soil Sensors", description: "Real-time nitrogen and moisture tracking for carbon yield.", credit_cost: 980, category: "sensor", icon_name: "Cpu" },
    { name: "Precision Irrigation Kit", description: "Reduces water waste by 40% using smart zone targeting.", credit_cost: 750, category: "equipment", icon_name: "Droplets" },
    { name: "Compost Accelerator", description: "Enzymatic blend to fast-track organic matter decomposition.", credit_cost: 200, category: "fertilizer", icon_name: "Recycle" },
    { name: "Canopy Net System", description: "Pollinators protection mesh for crop boundary areas.", credit_cost: 310, category: "equipment", icon_name: "Shield" },
];
async function seed() {
    await (0, postgres_1.connectPostgres)();
    const client = await postgres_1.pool.connect();
    try {
        await client.query("BEGIN");
        // Clear existing data
        await client.query("DELETE FROM transactions");
        await client.query("DELETE FROM marketplace_items");
        await client.query("DELETE FROM farmers");
        // Insert farmers
        for (const f of FARMERS) {
            await client.query(`INSERT INTO farmers (name, farm_name, phone, location, lat, lng, field_area_ha,
          farming_method, water_source, primary_crops, carbon_credits, weather)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, [f.name, f.farm_name, f.phone, f.location, f.lat, f.lng, f.field_area_ha,
                f.farming_method, f.water_source, f.primary_crops, f.carbon_credits,
                JSON.stringify(f.weather)]);
            log.info(`Seeded farmer: ${f.name}`);
        }
        // Insert marketplace items
        for (const item of MARKETPLACE_ITEMS) {
            await client.query(`INSERT INTO marketplace_items (name, description, credit_cost, category, icon_name)
         VALUES ($1,$2,$3,$4,$5)`, [item.name, item.description, item.credit_cost, item.category, item.icon_name]);
        }
        log.info("Seeded marketplace items");
        await client.query("COMMIT");
        log.info("✓ Seed complete");
    }
    catch (err) {
        await client.query("ROLLBACK");
        log.error("Seed failed", err);
        throw err;
    }
    finally {
        client.release();
        await postgres_1.pool.end();
    }
}
seed().catch(console.error);
//# sourceMappingURL=seed.js.map