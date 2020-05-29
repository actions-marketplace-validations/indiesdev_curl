import * as core from '@actions/core'
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import setOutput from './output'

export const validateStatusCode = (actualStatusCode: string): void => {
    const acceptedStatusCode: string[] = core.getInput('accept')
                                                .split(",").filter(x => x !== "")
                                                .map(x => x.trim());
    if(!acceptedStatusCode.includes(actualStatusCode)){
        throw new Error(`The accepted status code is ${acceptedStatusCode} but got ${actualStatusCode}`)
    }
}

export const buildOutput = (res: AxiosResponse <any>): string => {
    return JSON.stringify({
        "status_code": res.status,
        "data": res.data,
        "headers": res.headers
    })
}

export const sendRequestWithRetry = (config: AxiosRequestConfig): void => {
    var exit = false
    var countRetry = 0
    const retryArr: string[] = core.getInput('retry').split('/')
    const numberOfRetry: number = Number(retryArr[0])
    const backoff: number = Number(retryArr[1])
    do{
        axios(config)
            .then(res => {
                exit = true
                setOutput(res)
            })
            .catch(err =>  {
                countRetry += 1
                core.info(`retry: ${countRetry}`)
                if(countRetry <= numberOfRetry){
                    sleep(backoff)
                }else{
                    exit = true
                    core.setFailed(err)
                }
            })
    }while(!exit)
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
