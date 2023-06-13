import React, {useState,useEffect} from "react"
import {render,Text,useInput,Box,useStdout,Newline, Spacer} from "ink"
import Gradient from "ink-gradient"
import BigText from "ink-big-text"
import osu from "node-os-utils"
import os from "os"
import psList from "ps-list"
const mem = osu.mem;
const cpu = osu.cpu;
const osuos = osu.os;

import { exec } from 'child_process';

function getDiskUsage(callback) {
  let command;

  switch(os.platform()) {
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
    switch(platform) {
        case 'win32': name = 'Windows'; break;
        case 'darwin': name = 'macOS'; break;
        case 'linux': name = 'Linux'; break;
        default: name = platform; break;
    }

    return `${name} ${release}`;
}
async function getPrograms(){
    const programs = await psList();
    const result = {};
    let count = 0;
    let page = "0";
    for(let i=0;i<programs.length;i++){
        const program = programs[i]
        if(count==22){
            count = 0;
            page = (parseInt(page)+1).toString();
        }
        if(Object.keys(result).includes(page)){
            result[page].push(program)
        }else{
            result[page] = [program]
        }
        count+=1
    }
    return result
}
const App = ()=>{
    const {stdout}=useStdout()
    const [memInfo,setMemInfo] = useState(null)
    const [uptime,setUptime] = useState(null)
    const [pList,setPlist] = useState([])
    const [pCount, setPCount] = useState(0)
    const [cpuUsage,setCpuUsage] = useState(null)
    const [diskInfo,setDiskInfo] = useState(null)
    const [procInfo,setProcInfo] = useState(null)
    const [userInfo,setUserInfo] = useState(null)
    const [pageNumber,setPageNumber] = useState("0")
    function handlePageDown(){
        if(Object.keys(pList).includes((parseInt(pageNumber)+1).toString())){
            setPageNumber((parseInt(pageNumber)+1).toString())
        }
    }
    function handlePageUp(){
        if(Object.keys(pList).includes((parseInt(pageNumber)-1).toString())){
            setPageNumber((parseInt(pageNumber)-1).toString())
        }
    }
    useInput((input,key)=>{
        if(input==='q'){
            process.exit()
        }
        if(key.upArrow || input=="k"){
            handlePageUp()
        }
        if(key.downArrow || input=="j"){
            handlePageDown()
        }
    })
    useEffect(()=>{
        const timeLoop = setInterval(async ()=>{
        setPCount((await psList()).length)
        setPlist(await getPrograms())
        setUptime(osuos.uptime())
        setCpuUsage(await cpu.usage())
        getDiskUsage((error, data) => {
            if (error) {
            //   console.error(`Error getting disk usage: ${error}`);
            } else {
            //   console.log(`Disk usage:\n${data}`);
            setDiskInfo(data.replace(/\r/g, "").split("\n").slice(1,-2))
            }
        });
        setMemInfo(await mem.info())
        },100);
        return ()=>{
            clearInterval(timeLoop);
        }
    },[])
    return (
        (memInfo&&diskInfo&&pList)?
            <>
                <Box height={stdout.rows-4} borderStyle="single" flexDirection="column">
                    <Box flexDirection="row">
                        <Box>
                            <Gradient name="teen">
                                <BigText  font="tiny" text="TERASK"/>
                            </Gradient>
                        </Box>
                        <Box width="75%" marginLeft={5} flexDirection="column" borderStyle="single">
                            <Text bold>Username: <Text>{os.userInfo().username}</Text></Text>
                            <Text bold>OS: <Text>{getOSInfo()}</Text></Text>
                            <Text bold>Uptime: <Text>{uptime}</Text></Text>
                        </Box>
                    </Box>
                    <Box width={stdout.cols}>
                        <Box width="50%" height={7} borderStyle="single" flexDirection="column">
                            <Text underline bold>Memory</Text>
                            {/* <Spacer/> */}
                            <Text>
                                Memory Usage:<Text bold color={memInfo["usedMemPercentage"]>90?"red":memInfo["usedMemPercentage"]>50?"yellow":"red"}> {JSON.stringify(memInfo["usedMemPercentage"])}%</Text>
                            </Text>
                            {/* <Spacer/> */}
                            <Text>
                                Total Memory(Mb):<Text> {JSON.stringify(memInfo["totalMemMb"])}</Text>
                            </Text>
                            {/* <Spacer/> */}
                            {/* <Spacer/> */}
                            <Text>
                                Free Memory(Mb):<Text> {JSON.stringify(memInfo["freeMemMb"])}</Text>
                            </Text>
                            {/* <Spacer/> */}
                            <Text>
                                Used Memory(Mb):<Text> {JSON.stringify(memInfo["usedMemMb"])}</Text>
                            </Text>
                        </Box>
                        <Box width="50%" height={7} borderStyle="single" flexDirection="column">
                            <Text underline bold>CPU</Text>
                            {/* <Spacer/> */}
                            <Text>
                                CPU Used:<Text bold color={cpuUsage>90?"red":cpuUsage>50?"yellow":"green"}> {cpuUsage}%</Text>
                            </Text>
                            {/* <Spacer/> */}
                            <Text>Model: {cpu.model()}</Text>
                            {/* <Spacer/> */}
                            <Text>Count: {cpu.count()}</Text>
                            {/* <Spacer/> */}
                        </Box>
                        <Box width="50%" height={7} borderStyle="single" flexDirection="column">
                            <Text underline bold>Disk</Text>
                            {diskInfo.map((el)=>{
                            const data = el.split(" ").filter(x=>x.length>0)
                            const usePerc = (parseInt(data[1])/parseInt(data[2]))*100
                            return (<>
                            {/* <Spacer/> */}
                            <Text>
                            Disk {data[0]} <Text bold color={usePerc>90?"red":usePerc>50?"yellow":"green"}>{usePerc}%</Text>
                            </Text>
                            </>)
                            })}
                            {/* <Spacer/> */}
                        </Box>
                    </Box>
                    <Box width={stdout.cols}  height="100%" flexDirection="column">
                        <Text bold>Processes ({pCount})</Text>
                        <Box><Text bold color="cyan">PID - Process</Text></Box>
                        {pList[pageNumber].map(el=><Box><Text>{el.pid} - {el.name}</Text></Box>)}
                        <Text color="cyan">Page: {pageNumber}</Text>
                    </Box>
                </Box>
                <Box borderStyle="single">
                    <Text color="white" backgroundColor="red"> QUIT: q </Text>
                    <Text color="white" backgroundColor="#A020F0" marginLeft={1}> SCROLL: j/k </Text>
                </Box>
            </>
        :null
    ) 
}
const leaveAltScreenCommand = "\x1b[?1049l";
process.stdout.write('\x1b[?1049h\x1b[H\x1b[2J');
process.on("exit", () => {
  process.stdout.write(leaveAltScreenCommand);
});
render(<App/>)