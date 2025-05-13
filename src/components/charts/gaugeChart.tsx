import { useEffect, useState } from 'react';

import { makeCreditScore } from '@/app/api/endpoints/creditScoring/creditScoring';
import { useGenericMethod } from '@/hooks/useGenericMethod';

import axios from 'axios';
import ReactECharts from 'echarts-for-react';

interface GaugeChartProps {
    product_id: string;
    customer_id: string;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ product_id, customer_id }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [value, setValue] = useState<number>(0);
    const [minValue, setMinValue] = useState<number>(345);
    const [maxValue, setMaxValue] = useState<number>(855);

    const [loanAmount, setLoanAmount] = useState<number>(800);
    const [duration, setDuration] = useState<number>(800);
    const [interestRate, setInterestRate] = useState<number>(800);
    const [creditScoreCategory, setCreditScoreCategory] = useState<string>('');

    const creditScore = useGenericMethod({
        method: 'GET',
        apiMethod: makeCreditScore,
        skipWithOutParams: true
    });

    function randomIntFromInterval(min: number, max: number) {
        // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    useEffect(() => {
        console.log('==>', creditScore.data);
        if (creditScore.data || !creditScore.loading) {
            let score = parseInt(localStorage.getItem(`${product_id}-${customer_id}`) ?? '0');

            if (!score) {
                score = randomIntFromInterval(350, 850);
                localStorage.setItem(`${product_id}-${customer_id}`, `${score}`);
            }
            setValue(score);
            setLoading(false);
        }
    }, [creditScore.data]);

    useEffect(() => {
        creditScore
            .handleAction({
                // customerId: 'bbf0969e-eb2a-42d9-8c2d-1e3241845660'
                product_id,
                customerId: customer_id
            })
            .then((ele) => console.log('pocosi', ele))
            .catch((err) => {});
    }, []);

    const option = {
        series: [
            {
                type: 'gauge',
                startAngle: 180,
                endAngle: 0,
                min: minValue,
                max: maxValue,
                splitNumber: 10,
                axisLine: {
                    lineStyle: {
                        width: 20,
                        color: [
                            [0.3, '#F54E5E'], // Red up to 30%
                            [0.7, '#FDD835'], // Yellow up to 70%
                            [1, '#4CAF50'] // Green for the rest
                        ]
                    }
                },
                itemStyle: {
                    color: '#FFC107' // Pointer color
                },
                splitLine: {
                    show: false
                },
                pointer: {
                    icon: 'image://chartIcons/pointer.png',
                    length: '40rem',
                    width: '40rem',
                    offsetCenter: [0, '-81%']
                },
                axisLabel: {
                    show: false
                },
                detail: {
                    fontSize: 20,
                    offsetCenter: [0, '60%'],
                    formatter: '', // Display value as percentage
                    color: '#333',
                    show: false
                },
                data: [
                    {
                        value: loading ? 0 : value,
                        // hide value on ui
                        // label: {
                        show: false,
                        // },
                        name: 'Credit Score'
                    }
                ], // Set initial value
                axisTick: {
                    length: 5,

                    lineStyle: {
                        color: '#64748B',
                        width: 1
                    }
                }
            }
        ],

        graphic: [
            // First Text - Title
            loading
                ? {
                      type: 'text',
                      left: 'center',
                      top: '50%',
                      style: {
                          text: 'Loading...',
                          font: 'bold 24px Arial',
                          fill: '#333'
                      }
                  }
                : {
                      type: 'text',
                      left: 'center',
                      top: '35%',
                      style: {
                          text: value ?? '721',
                          font: 'bold 32px Arial',
                          fill: '#333'
                      }
                  },
            // Second Text - Bottom Left
            loading
                ? {
                      type: 'text',
                      left: 'center',
                      top: '50%',
                      style: {
                          text: 'Loading...',
                          font: 'bold 24px Arial',
                          fill: '#333'
                      }
                  }
                : {
                      type: 'text',
                      left: 'center',
                      top: '45%',
                      style: {
                          text: creditScoreCategory,
                          font: '32px Arial',
                          fill: '#333'
                      }
                  }
            // !loading && {
            //   type: 'text',
            //   left: '10%',
            //   top: '65%',
            //   style: {
            //     text: 'Loan Amount: ' + loanAmount,
            //     font: '18px Arial',
            //     fill: '#333',
            //   },
            // },
            // !loading && {
            //   type: 'text',
            //   left: '10%',
            //   top: '70%',
            //   style: {
            //     text: 'Loan Duration: ' + duration + " days",
            //     font: '18px Arial',
            //     fill: '#333',
            //   },
            // },
            // !loading && {
            //   type: 'text',
            //   left: '10%',
            //   top: '75%',
            //   style: {
            //     text: 'Interest rate: ' + interestRate,
            //     font: '18px Arial',
            //     fill: '#333',
            //   },
            // }
        ]
    };

    return (
        <div>
            <div
                style={{ width: '100%', height: '15.7rem' }}
                className='absolute top-[-5.5rem] flex items-start justify-start align-top'>
                <ReactECharts option={option} style={{ height: '200%', width: '100%' }} />
            </div>
        </div>
    );
};

export default GaugeChart;
