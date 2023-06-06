import { NextFunction, Request, Response } from "express";
import { requestHandler } from "../utils/RequestHandler";
import { config as dotenv } from "dotenv";
import ErrorHandler from "../utils/ErrorHandler";
import axios from "axios";

const Block = require('../models').Block;

dotenv();

class HistoryController {
    read = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const data = req.body;
            axios.get(`http://10.0.2.7:8181/device-test/log/${data.page}?from=${data.address}&device_id=${data.device_id}`)
            .then(function (response) {
                console.log(response)
                res.status(200).send(response.data);
            })
            .catch(function (error) {
                console.log(error)
                res.status(500).send(error);
            });
        } catch (e) {
            console.log(e)
            return res.status(500).send((e as Error));;
        }
    }

    block = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const data = req.body;

            const block = await Block.create({
                block_number: data.block_number,
                date: data.date,
                device_id: data.device_id
            });
            console.log(block)
            res.status(200).send(block);
           
        } catch (e) {
            console.log(e)
            return res.status(500).send((e as Error));;
        }
    }


}

export default new HistoryController();