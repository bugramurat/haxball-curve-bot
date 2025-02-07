# Haxball Curve Bot
Haxball curve bot with indicator *(adjustable curved shot and power shot)* with node-haxball API
<br><br>
Also has a *cool* goal celebration effect
<br><br>
You can use this bot with custom maps but you must create **extra discs and their joints** for *indicator* and arrange their **ID's** in *curve_bot.js* file

## Preview
![preview](https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3VhNnp1ZzI5djUycXU0NDY5ZzRpNXBmeTJpcmV1b21xcG5oNzlnayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/0ybbkT6wrH94PYXFNV/giphy.gif)

## How to run
Run this to **download** this project: *(or download manually and go to your project-folder path)*
```
git clone https://github.com/bugramurat/haxball-curve-bot.git
cd haxball-curve-bot
```
Install dependecies:
```
npm install
npm install node-haxball
```
**Paste your token** here in *curve_bot.js* file to run this bot *(https://www.haxball.com/headlesstoken)*
```
const HEADLESS_TOKEN = "insert_your_headless_haxball_token_here"
```
Run the bot:
```
node curve_bot.js
```
(You can adjust your room's name and other settings in *curve_bot.js* file)

## Indicator colors
- *Green* for light curved shot
- *Yellow* for medium curved shot
- *Red* for hard curved shot
- *Purple* for power shot

## Libraries
- node-haxball

<br></br>
*For further information: bugramurat4444@gmail.com or discord: buggyraz*
