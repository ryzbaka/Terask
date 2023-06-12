import React, { useState, useEffect } from "react";
import { render, Text, useInput, Box, useStdout, Newline, Spacer } from "ink";
import Gradient from "ink-gradient";
import BigText from "ink-big-text";
import osu from "node-os-utils";
import os from "os";
const mem = osu.mem;
const cpu = osu.cpu;
const osuos = osu.os;
import { exec } from 'child_process';
function getDiskUsage(callback) {
  let command;
  switch (os.platform()) {
    case 'win32':
      command = 'wmic logicaldisk get size,freespace,caption';
      break;
    case 'darwin':
    case 'linux':
    default:
      command = 'df -h';
      break;
  }
  exec(command, (error, stdout, stderr) => {
    if (error) {
      //   console.error(`exec error: ${error}`);
      return callback(error);
    }
    return callback(null, stdout);
  });
}

// Using the function

function getOSInfo() {
  let platform = os.platform();
  let release = os.release();

  // Map the platform to a human-readable name
  let name;
  switch (platform) {
    case 'win32':
      name = 'Windows';
      break;
    case 'darwin':
      name = 'macOS';
      break;
    case 'linux':
      name = 'Linux';
      break;
    default:
      name = platform;
      break;
  }
  return `${name} ${release}`;
}
const App = () => {
  const {
    stdout
  } = useStdout();
  const [memInfo, setMemInfo] = useState(null);
  const [uptime, setUptime] = useState(null);
  const [osInfo, setOsInfo] = useState(null);
  const [cpuUsage, setCpuUsage] = useState(null);
  const [diskInfo, setDiskInfo] = useState(null);
  const [procInfo, setProcInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  useInput((input, key) => {
    if (input === 'q') {
      process.exit();
    }
  });
  useEffect(() => {
    const timeLoop = setInterval(async () => {
      setUptime(osuos.uptime());
      setCpuUsage(await cpu.usage());
      getDiskUsage((error, data) => {
        if (error) {
          //   console.error(`Error getting disk usage: ${error}`);
        } else {
          //   console.log(`Disk usage:\n${data}`);
          setDiskInfo(data.replace(/\r/g, "").split("\n").slice(1, -2));
        }
      });
      setMemInfo(await mem.info());
    }, 100);
    return () => {
      clearInterval(timeLoop);
    };
  }, []);
  return memInfo && diskInfo ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Box, {
    height: stdout.rows - 4,
    borderStyle: "single",
    flexDirection: "column"
  }, /*#__PURE__*/React.createElement(Box, {
    flexDirection: "row"
  }, /*#__PURE__*/React.createElement(Box, null, /*#__PURE__*/React.createElement(Gradient, {
    name: "teen"
  }, /*#__PURE__*/React.createElement(BigText, {
    font: "tiny",
    text: "TERASK"
  }))), /*#__PURE__*/React.createElement(Box, {
    width: "75%",
    marginLeft: 5,
    flexDirection: "column",
    borderStyle: "single"
  }, /*#__PURE__*/React.createElement(Text, {
    bold: true
  }, "Username: ", /*#__PURE__*/React.createElement(Text, null, os.userInfo().username)), /*#__PURE__*/React.createElement(Text, {
    bold: true
  }, "OS: ", /*#__PURE__*/React.createElement(Text, null, getOSInfo())), /*#__PURE__*/React.createElement(Text, {
    bold: true
  }, "Uptime: ", /*#__PURE__*/React.createElement(Text, null, uptime)))), /*#__PURE__*/React.createElement(Box, {
    width: stdout.cols
  }, /*#__PURE__*/React.createElement(Box, {
    width: "50%",
    height: 10,
    borderStyle: "single",
    flexDirection: "column"
  }, /*#__PURE__*/React.createElement(Text, {
    underline: true,
    bold: true
  }, "Memory"), /*#__PURE__*/React.createElement(Spacer, null), /*#__PURE__*/React.createElement(Text, null, "Memory Usage:", /*#__PURE__*/React.createElement(Text, {
    bold: true,
    color: memInfo["usedMemPercentage"] > 90 ? "red" : memInfo["usedMemPercentage"] > 50 ? "yellow" : "red"
  }, " ", JSON.stringify(memInfo["usedMemPercentage"]), "%")), /*#__PURE__*/React.createElement(Spacer, null), /*#__PURE__*/React.createElement(Text, null, "Total Memory(Mb):", /*#__PURE__*/React.createElement(Text, null, " ", JSON.stringify(memInfo["totalMemMb"]))), /*#__PURE__*/React.createElement(Spacer, null), /*#__PURE__*/React.createElement(Spacer, null), /*#__PURE__*/React.createElement(Text, null, "Free Memory(Mb):", /*#__PURE__*/React.createElement(Text, null, " ", JSON.stringify(memInfo["freeMemMb"]))), /*#__PURE__*/React.createElement(Spacer, null), /*#__PURE__*/React.createElement(Text, null, "Used Memory(Mb):", /*#__PURE__*/React.createElement(Text, null, " ", JSON.stringify(memInfo["usedMemMb"])))), /*#__PURE__*/React.createElement(Box, {
    width: "50%",
    height: 10,
    borderStyle: "single",
    flexDirection: "column"
  }, /*#__PURE__*/React.createElement(Text, {
    underline: true,
    bold: true
  }, "CPU"), /*#__PURE__*/React.createElement(Spacer, null), /*#__PURE__*/React.createElement(Text, null, "CPU Used:", /*#__PURE__*/React.createElement(Text, {
    bold: true,
    color: cpuUsage > 90 ? "red" : cpuUsage > 50 ? "yellow" : "green"
  }, " ", cpuUsage, "%")), /*#__PURE__*/React.createElement(Spacer, null), /*#__PURE__*/React.createElement(Text, null, "Model: ", cpu.model()), /*#__PURE__*/React.createElement(Spacer, null), /*#__PURE__*/React.createElement(Text, null, "Count: ", cpu.count()), /*#__PURE__*/React.createElement(Spacer, null)), /*#__PURE__*/React.createElement(Box, {
    width: "50%",
    height: 10,
    borderStyle: "single",
    flexDirection: "column"
  }, /*#__PURE__*/React.createElement(Text, {
    underline: true,
    bold: true
  }, "Disk"), diskInfo.map(el => {
    const data = el.split(" ").filter(x => x.length > 0);
    const usePerc = parseInt(data[1]) / parseInt(data[2]) * 100;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Spacer, null), /*#__PURE__*/React.createElement(Text, null, "Disk ", data[0], " ", /*#__PURE__*/React.createElement(Text, {
      bold: true,
      color: usePerc > 90 ? "red" : usePerc > 50 ? "yellow" : "green"
    }, usePerc, "%")));
  }), /*#__PURE__*/React.createElement(Spacer, null))), /*#__PURE__*/React.createElement(Box, null, /*#__PURE__*/React.createElement(Text, null, "OK"))), /*#__PURE__*/React.createElement(Box, {
    borderStyle: "single"
  }, /*#__PURE__*/React.createElement(Text, {
    color: "white",
    backgroundColor: "red"
  }, " QUIT: q "))) : null;
};
const leaveAltScreenCommand = "\x1b[?1049l";
process.stdout.write('\x1b[?1049h\x1b[H\x1b[2J');
process.on("exit", () => {
  process.stdout.write(leaveAltScreenCommand);
});
render( /*#__PURE__*/React.createElement(App, null));
