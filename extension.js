// Sound Effect from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=music&amp;utm_content=40142">Pixabay</a>
const vscode = require('vscode');
// import * as memento from 'memento';
// import { Memento } from "vscode";
// import { Memento } from 'vscode';
let workTime;
let shortBreakTime;
let longBreakTime;
let pomodoros;
let interval;
// const memento = context.globalState;

function activate(context) {
	let setupChannel = vscode.window.createOutputChannel("Setup");
	const memento = context.globalState;

	context.subscriptions.push(
		vscode.commands.registerCommand("Pomodoro.setTimer", async () => {
			let previousChoice = vscode.window.showInputBox({
				placeHolder: "Do you want to use your previous setup? (y/n)"
			})
			if ((await previousChoice).toLowerCase().toString() == "y" || (await previousChoice).toLowerCase().toString() == "yes") {
				if (!(workTime == undefined ||  shortBreakTime == undefined || longBreakTime == undefined || pomodoros == undefined)) {

				} else {
					vscode.window.showErrorMessage("Something went wrong! Create new setup");
				}
			}
			workTime = setWorkTime();
			if (await workTime != "") {	shortBreakTime = setShortBreakTime(); }
			if (await shortBreakTime != "") { longBreakTime = setLongBreakTime(); }
			if (await longBreakTime != "") { pomodoros = setPomodoros(); }
			memento.update();
			return;
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("Pomodoro.seeSetup", async () => {
			if (workTime == undefined ||  shortBreakTime == undefined || longBreakTime == undefined || pomodoros == undefined) {
				vscode.window.showInformationMessage("You need to set your timer before you can see setup.");
			} else {
				setupChannel.clear();
				setupChannel.appendLine("Work time: " + await workTime);
				setupChannel.appendLine("Small break: " + await shortBreakTime);
				setupChannel.appendLine("Large break: " + await longBreakTime);
				setupChannel.appendLine("Pomodoros: " + await pomodoros);
				setupChannel.appendLine((await vscode.commands.getCommands()).toString());
				setupChannel.show();
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("Pomodoro.startTimer", async () => {
			const pomodorosNum = await pomodoros;
			if (pomodorosNum) {
				countdown(workTime, shortBreakTime, longBreakTime, parseInt(pomodorosNum));
			}
		})
	);	

	context.subscriptions.push(
		vscode.commands.registerCommand("Pomodoro.stopTimer", async () => {
			clearInterval(interval);
			setStatusMessage(0, "stop");
		})
	);
}

async function setWorkTime() {
	let workTime = await vscode.window.showInputBox({
		placeHolder: "How many minutes is your work time?"
	});
	while(!isNumeric(workTime)) {
		workTime = await vscode.window.showInputBox({
			placeHolder: "Enter a valid number for your work time."
		});
	}
	vscode.window.showInformationMessage("Your work time is: " + workTime + " minutes.");
	return workTime;
}

async function setShortBreakTime() {
	let breakTime = await vscode.window.showInputBox({
		placeHolder: "How many minutes is your small break?"
	});
	while(!isNumeric(breakTime)) {
		breakTime = await vscode.window.showInputBox({
			placeHolder: "Enter a valid number for your small break time."
		});
	}
	vscode.window.showInformationMessage("Your small break is: " + breakTime + " minutes.");
	return breakTime;
}

async function setLongBreakTime() {
	let breakTime = await vscode.window.showInputBox({
		placeHolder: "How many minutes is your long break?"
	});
	while(!isNumeric(breakTime)) {
		breakTime = await vscode.window.showInputBox({
			placeHolder: "Enter a valid number for your long break time."
		});
	}
	vscode.window.showInformationMessage("Your long break is: " + breakTime + " minutes.");
	return breakTime;
}

async function setPomodoros() {
	let pomodoros = await vscode.window.showInputBox({
		placeHolder: "How many pomodoros do you want to do between each long break?"
	});
	while(!isNumeric(pomodoros)) {
		pomodoros = await vscode.window.showInputBox({
			placeHolder: "Enter a valid number for pomodoros."
		});
	}
	vscode.window.showInformationMessage("You are doing " + pomodoros + " pomodoros between your long breaks.");
	return pomodoros;
}

/**
 * @param {any} time
 * @param {string} modus
 */
async function setStatusMessage(time, modus) {
	let timeNum = await time;
	let min = Math.floor(timeNum / 60);
	let minStr;
	let sec = timeNum % 60;
	let secStr;
	
	if (min < 10) {
		minStr = "0" + min;
	} else {
		minStr = min.toString();
	}

	if (sec < 10) {
		secStr = "0" + sec;
	} else {
		secStr = sec.toString();
	}

	if (modus == "work") {
		vscode.window.setStatusBarMessage("🍅 " + minStr + ":" + secStr);
	} else if (modus == "shortBreak") {
		vscode.window.setStatusBarMessage("🏖️ " + minStr + ":" + secStr)		
	} else if (modus == "longBreak") {
		vscode.window.setStatusBarMessage("🛫 " + minStr + ":" + secStr);	
	} else if (modus == "stop") {
		vscode.window.setStatusBarMessage("");	
	}
}

async function countdown(workTime, shortBreakTime, longBreakTime, pomodoros) {	
	let time;
	let modus;
	let modusarray = setModusArray(pomodoros);
	
	interval = setInterval(async function () {
		if (time > 0) {
			time--;
		} else {
			let firstItem = modusarray.shift();
			modusarray.push(firstItem);
			if (modusarray[0] == "work") {
				modus = "work";
				time = await workTime;
			} else if (modusarray[0] == "shortBreak") {
				modus = "shortBreak";
				time = await shortBreakTime;
			} else if (modusarray[0] == "longBreak") {
				modus = "longBreak";
				time = await longBreakTime;
			}
		}
		setStatusMessage(time, modus);
	}, 1000);	
}

function setModusArray(pomodoros) {
	let modusArray = [];
	
	for (let i = 0; i < pomodoros; i++) {
		modusArray.push("shortBreak");
		modusArray.push("work");
	}
	modusArray.push("longBreak");
	modusArray.push("work");
	
	return modusArray;
}

// Function gotten from: https://www.delftstack.com/howto/javascript/check-if-string-is-number-javascript/
function isNumeric(val) {
    return /^-?\d+$/.test(val);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
