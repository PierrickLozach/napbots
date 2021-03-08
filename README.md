# Dynamic Napbots Allocation

Based on a [gist](https://gist.github.com/julienarcin/af2727307de2fd37d6a72973eafdbfc9) from [@julienarcin](https://gist.github.com/julienarcin).

This node.js app allocates napbots bots based on the current [weather condition](https://platform.napbots.com/crypto-weather).

![Screenshot](images/screenshot.png)

## Requirements

- [git](https://git-scm.com/)
- [node.js](https://nodejs.org/en/)
- A [Napbots](https://platform.napbots.com/) account
- Your Napbots user id. Check [this link](https://imgur.com/a/fW4I8Be) to find out how to retrieve your user id
- Default compositions (which bots to use based on the weather condition) are in `index.js`

## Usage

- Clone this repository: `git clone https://github.com/PierrickI3/napbots`
- Open a terminal and cd to the `napbots` folder
- Run `npm install` to install all dependencies
- Create a new file called `.env` and add the following entries:
  - `NAPBOTS_EMAIL=email@domain.com` (Email address you use to login to Napbots)
  - `NAPBOTS_PASSWORD=mypassword` (your Napbots password)
  - `NAPBOTS_USERID=xxxxxxxxxxxxx` (check above on how to get your user id)
- Run the app: `npm start`
- Wait until the app is done with either `Success!`, `No updates are necessary` or an error message if something bad happened.

## Adding more bots

- To add another bot in the composition, check [this image](https://imgur.com/a/ayit9pR) to find out how to retrieve a bot id
- Edit `index.js` and change the `compositions` object accordingly

## Running as an AWS lambda

- Login to your AWS account via the AWS CLI: `aws configure`
- Run `serverless deploy`. Default is set to run every 10 minutes.