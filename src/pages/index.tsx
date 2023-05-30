import { apiReq } from "@/server/utils";
import { useState, useEffect } from "react";
import Select from '@mui/material/Select';
import { MenuItem, ModalRoot } from "@mui/material";
import { Button } from "@mui/material";
import { FormControl } from "@mui/material";
import { Typography } from "@mui/material";
import getGraph from "./graph";
import { int } from "aws-sdk/clients/datapipeline";

const displayData = () => {
    const [dateList, setDateList] = useState<Array<string>>([])
    const [waterConsumedList, setWaterConsumedList] = useState<Array<int>>([])

    const [nodeValue, setNodeValue] = useState<String | null>(null)
    const [ohtId, setOhtId] = useState<String>("")
    const [ugsId, setUgsId] = useState<String | null>(null)
    const [motorId, setMotorId] = useState<String>("")

    const [motorStatus, setMotorStatus] = useState<any>(null)
    const [ugsWaterLevel, setUgsWaterLevel] = useState<any>(null)
    const [ohtWaterLevel, setOhtWaterLevel] = useState<any>(null) 
    const [ugsWaterConsumption, setUgsWaterConsumption] = useState<any>(null)
    const [ohtWaterConsumption, setOhtWaterConsumption] = useState<any>(null)

    const scanTable = async (tableName : String) => {
        const items = await apiReq("data", {
            type: 'ALL_DATA',
            tableName : tableName
        }) as any[];

        console.log("Scan All Items ", items)
        return items
    }

    const scanIdData = async (id : String, tableName : String) => {
        const items = await apiReq("data", {
            type: 'SCAN_ID_ALL_DATA',
            tableName : tableName,
            id : id
        }) as any[];

        console.log("Scan All Items ", items)
        return items
    }

    const latestIdData = async (id : String, tableName : String) => {
        const data = await apiReq ("data", {
            type : 'LATEST_ID_DATA',
            tableName : tableName,
            id : id  
        }) as any [];

        console.log("Latest Data ", data)
        return data
    }

    const handleNodeChange = (e : any) => {
        e.preventDefault();
        setNodeValue(e.target.value)
        setMotorId(e.target.value + '_' + e.target.value)
        setOhtId(e.target.value + '_oht')
        setUgsId(e.target.value + '_ugs')
    }

    const getGraphValues = () => {
        {scanIdData(ohtId as string, "swm_water_consumption")
            .then((result) => {
                console.log("length", result.length)
                var dateList: Array<string> = [];
                var consumptionList : Array<int> = []

                for (var i = 0; i < result.length; i++) {
                    dateList.push(result[i]['date']);
                    consumptionList.push(result[i]['water_consumption']);
                }
                console.log("datelist", dateList)
                console.log("consumptionList", consumptionList)
                setDateList(dateList)
                setWaterConsumedList(consumptionList)
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
        })}
        return null
    }

    useEffect (() => {
        {motorId?
                latestIdData(motorId as string, "swm_motor_state")
                    .then((result) => {
                        setMotorStatus(result);
                        console.log("Motor Status: ", result)
                    })
                    .catch((error) => {
                        console.error('Error fetching data:', error);
                })
                :
                null
        }

        {ugsId ?
                <>
                {latestIdData(ugsId as string, "swm_water_levels")
                    .then((result) => {
                        setUgsWaterLevel(result);
                    })
                    .catch((error) => {
                        console.error('Error fetching data:', error);
                })}
                {latestIdData(ugsId as string, "swm_water_consumption")
                    .then((result) => {
                        setUgsWaterConsumption(result);
                    })
                    .catch((error) => {
                        console.error('Error fetching data:', error);
                })}
                {scanIdData(ugsId as string, "swm_water_consumption")
                    .then((result) => {
                        console.log("SCAN ID ", result)
                        console.log("SCAN ID date", result['date'])
                    })
                    .catch((error) => {
                        console.error('Error fetching data:', error);
                })}
                </>
                :
                null
        }

        {ohtId ?
                <>
                {latestIdData(ohtId as string, "swm_water_levels")
                    .then((result) => {
                        setOhtWaterLevel(result);
                    })
                    .catch((error) => {
                        console.error('Error fetching data:', error);
                })}
                {latestIdData(ohtId as string, "swm_water_consumption")
                    .then((result) => {
                        setOhtWaterConsumption(result);
                        console.log("oht water", result)
                    })
                    .catch((error) => {
                        console.error('Error fetching data:', error);
                })}

                {/* {scanIdData(ohtId as string, "swm_water_consumption")
                    .then((result) => {
                        console.log("length", result.length)
                        var dateList: Array<string> = [];
                        var consumptionList : Array<int> = []

                        for (var i = 0; i < result.length; i++) {
                            dateList.push(result[i]['date']);
                            consumptionList.push(result[i]['water_consumption']);
                        }
                        console.log("datelist", dateList)
                        console.log("consumptionList", consumptionList)
                        setDateList(dateList)
                        setWaterConsumedList(consumptionList)
                    })
                    .catch((error) => {
                        console.error('Error fetching data:', error);
                })} */}
                </>
                :
                null
        }
        
    }, [nodeValue]);
    

    return (
        <div>
        <FormControl>
            <Select 
            placeholder="Select Node" 
            onChange={(event) => handleNodeChange(event)}
            // onChange={(event) => setNodeValue(event.target.value as String)}
            required>
                <MenuItem value="1">Node 1</MenuItem>
                <MenuItem value="2">Node 2</MenuItem>
                <MenuItem value="3">Node 3</MenuItem>
                <MenuItem value="4">Node 4</MenuItem>
            </Select>
        </FormControl>

        {motorStatus?
            <Typography>Motor Staus: 
                <span style={{ color: motorStatus["motor_status"]=="on" ? 'green' : 'red' }}>
                    {motorStatus["motor_status"]}
                </span>
          </Typography>
            :
            <Typography>Select Node</Typography>
        }
        {ugsWaterLevel ?
                <Typography>Sump Water Level: 
                    <span style={{ color: ugsWaterLevel['water_level']==0 ? 'red' : 'black' }}>
                        {ugsWaterLevel['water_level']==2?" Half" : (ugsWaterLevel['water_level']==0?" Empty" : " Full")}
                    </span>
                </Typography>
                :
                null
        }
        {ohtWaterLevel ?
                <Typography>Overhead Tank Level: {ohtWaterLevel['water_level']==2?"Half" : (ohtWaterLevel['water_level']==0?"Empty" : "Full")}</Typography>
                :
                null
        }
        {ugsWaterConsumption ?
                <Typography>Sump Water Consumption: {ugsWaterConsumption['water_consumption']}</Typography>
                :
                null
        }
        {ohtWaterConsumption ?
                <Typography>Overhead Tank Consumption on {ohtWaterConsumption['date']}: {ohtWaterConsumption['water_consumption']} </Typography>
                :
                null
        }
        <Button onClick={() => getGraphValues()}>Show Graph</Button>
        {/* {(dateList && waterConsumedList)?
            <> */}
                {getGraph(dateList, waterConsumedList)}
                {/* {console.log("date: ", dateList)}
                {console.log("water cons: ", waterConsumedList)} */}
            {/* </>
            :
            null
        } */}
        </div>
    );
}

export default displayData;