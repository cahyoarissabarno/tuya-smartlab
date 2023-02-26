import { NextFunction, Request, Response } from "express";
import { requestHandler } from "../utils/RequestHandler";
import { config as dotenv } from "dotenv";
import ErrorHandler from "../utils/ErrorHandler";
import axios from "axios";

const History = require('../models').History;
const User = require('../models').User;
const Device = require('../models').Device;

dotenv();

class HistoryController {
    read = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const data = req.body;
            axios.get(`http://10.0.2.7:8181/device-test/log?from=${data.address}&device_id=${data.device_id}`)
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


}

export default new HistoryController();