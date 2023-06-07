import { NextFunction, Request, Response } from "express";
import { requestHandler } from "../utils/RequestHandler";
import { config as dotenv } from "dotenv";
import ErrorHandler from "../utils/ErrorHandler";
import axios from "axios";
import { Op } from 'sequelize';

const Block = require('../models').Block;

dotenv();

class HistoryController {
    read = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const data = req.body;
            const itemsPerPage = 5; // Jumlah item per halaman
            const currentPage = data.page; // Halaman saat ini
            const offset = (currentPage - 1) * itemsPerPage;

            const blocks = await Block.findAll({
                where: {
                    device_id: data.device_id

                    // device_id: req.body.device_id,
                    // block_number: {
                    //     [Op.gte]: 5
                    // }
                },
                limit: itemsPerPage,
                offset: offset,
                order: [['block_number', 'ASC']]
            })

            const jsonResult = blocks.map((block:any) => block.toJSON());
            const pageData = jsonResult.sort((a: any, b:any) => a.block_number - b.block_number);
            const fromBlock = pageData[0].block_number;
            const toBlock = pageData[pageData.length - 1].block_number;
            console.log(pageData)
            console.log(fromBlock, toBlock);
            // res.status(200).send({from: pageData[0].block_number, to: pageData[4].block_number});
            // res.status(200).send(pageData);
            
            // axios.get(`http://10.0.2.7:8181/device-test/log/${data.page}?from=${data.address}&device_id=${data.device_id}&fromBlock=${fromBlock}&toBlock=${toBlock}`)
            axios.get(`http://localhost:8080/device-test/log/${data.page}?from=${data.address}&device_id=${data.device_id}&fromBlock=${fromBlock}&toBlock=${toBlock}`)
            .then(function (response) {
                // console.log(response)
                res.status(200).send(response.data);
            })
            .catch(function (error) {
                console.log(error)
                res.status(500).send(error);
            });
            
            // console.log(find)
        } catch (e) {
            console.log(e)
            return res.status(500).send((e as Error));;
        }
    }

    readByDate = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const data = req.body;
            const itemsPerPage = 5; // Jumlah item per halaman
            const currentPage = data.page; // Halaman saat ini
            const offset = (currentPage - 1) * itemsPerPage;

            const blocks = await Block.findAll({
                where: {
                    device_id: data.device_id,

                    // device_id: req.body.device_id,
                    // block_number: {
                    //     [Op.gte]: 5
                    // }
                    date: {
                        [Op.between]: [data.fromDate, data.toDate]
                    }
                },
                limit: itemsPerPage,
                offset: offset,
                order: [['block_number', 'ASC']]
            })

            const jsonResult = blocks.map((block:any) => block.toJSON());
            const pageData = jsonResult.sort((a: any, b:any) => a.block_number - b.block_number);
            const fromBlock = pageData[0].block_number;
            const toBlock = pageData[pageData.length - 1].block_number;
            console.log(pageData)
            console.log(fromBlock, toBlock);
            // res.status(200).send({from: pageData[0].block_number, to: pageData[4].block_number});//
            // res.status(200).send(blocks);
            
            axios.get(`http://10.0.2.7:8181/device-test/log/${data.page}?from=${data.address}&device_id=${data.device_id}&fromBlock=${fromBlock}&toBlock=${toBlock}`)
            // axios.get(`http://localhost:8080/device-test/log/${data.page}?from=${data.address}&device_id=${data.device_id}&fromBlock=${fromBlock}&toBlock=${toBlock}`)
            .then(function (response) {
                // console.log(response)
                res.status(200).send(response.data);
            })
            .catch(function (error) {
                console.log(error)
                res.status(500).send(error);
            });
            
            // console.log(find)
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