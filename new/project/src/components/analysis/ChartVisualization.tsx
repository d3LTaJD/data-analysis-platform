import React, { useState } from 'react';
import ApexCharts from "react-apexcharts";
import { format } from 'date-fns';
import { Download, ZoomIn, ZoomOut, RotateCcw, Settings, BarChart3, TrendingUp, Activity } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ChartDataPoint {
  date: string;
  actual: number;
  predicted?: number;
}

interface CandlestickDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ChartVisualizationProps {
  data: {
    plot?: string;
    line_data?: ChartDataPoint[];
    ohlc?: CandlestickDataPoint[];
    rmse?: number;
    summary?: string;
    forecast?: number[];
    // Healthcare analysis results
    chart_type?: string;
    data?: any;
    insights?: string[];
    error?: string;
  } | null;
  role: string;
  chartType: 'line' | 'bar' | 'candlestick';
  showForecast?: boolean;
}

export const ChartVisualization: React.FC<ChartVisualizationProps> = ({ 
  data, 
  role,
  chartType, 
  showForecast = false 
}) => {
  const [currentChartType, setCurrentChartType] = useState(chartType);
  const [chartHeight, setChartHeight] = useState(600);
  const [showControls, setShowControls] = useState(true);

  // Handle healthcare and ecommerce analysis results with cleaner, more understandable charts
  const renderAnalysisChart = () => {
    if (!data || !data.chart_type || !data.data) {
      return null;
    }

    const chartData = data.data;
    
    // Common styling for better readability
    const commonStyling = {
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      grid: {
        borderColor: '#374151',
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        }
      },
      theme: {
        mode: 'dark'
      },
      legend: {
        position: 'top',
        horizontalAlign: 'center',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        labels: {
          colors: '#ffffff'
        }
      },
      tooltip: {
        theme: 'dark',
        style: {
          fontSize: '12px'
        },
        y: {
          formatter: function(val: any) {
            return val.toLocaleString()
          }
        }
      }
    };
    
    switch (data.chart_type) {
      case 'survival_curve':
        return {
          series: [{
            name: 'Survival Rate (%)',
            data: chartData.survival_rates || [],
            color: '#3B82F6'
          }],
          options: {
            ...commonOptions,
            ...commonStyling,
            chart: {
              ...commonOptions.chart,
              type: 'line' as const
            },
            stroke: {
              curve: 'smooth',
              width: 4
            },
            markers: {
              size: 6,
              colors: ['#3B82F6'],
              strokeColors: '#ffffff',
              strokeWidth: 2
            },
            xaxis: {
              categories: chartData.time_periods || [],
              title: { 
                text: 'Time Period (Days)',
                style: { color: '#ffffff', fontSize: '14px' }
              },
              labels: {
                style: { colors: '#9CA3AF', fontSize: '12px' }
              }
            },
            yaxis: {
              title: { 
                text: 'Survival Rate (%)',
                style: { color: '#ffffff', fontSize: '14px' }
              },
              min: 0,
              max: 100,
              labels: {
                style: { colors: '#9CA3AF', fontSize: '12px' },
                formatter: function(val: any) {
                  return val + '%'
                }
              }
            },
            title: { 
              text: `${role.replace('_', ' ').toUpperCase()} - Patient Survival Analysis`,
              style: { color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }
            }
          }
        };
      
      case 'bar_chart':
        return {
          series: [{
            name: 'Number of Cases',
            data: chartData.counts || [],
            color: '#10B981'
          }],
          options: {
            ...commonOptions,
            ...commonStyling,
            chart: {
              ...commonOptions.chart,
              type: 'bar'
            },
            plotOptions: {
              bar: {
                borderRadius: 8,
                columnWidth: '60%',
                distributed: true,
                colors: {
                  ranges: [{
                    from: 0,
                    to: 1000,
                    color: '#10B981'
                  }]
                }
              }
            },
            xaxis: {
              categories: chartData.diseases || [],
              title: { 
                text: 'Disease Types',
                style: { color: '#ffffff', fontSize: '14px' }
              },
              labels: {
                style: { colors: '#9CA3AF', fontSize: '12px' },
                rotate: -45,
                rotateAlways: false
              }
            },
            yaxis: {
              title: { 
                text: 'Number of Patients',
                style: { color: '#ffffff', fontSize: '14px' }
              },
              labels: {
                style: { colors: '#9CA3AF', fontSize: '12px' }
              }
            },
            title: { 
              text: `${role.replace('_', ' ').toUpperCase()} - Disease Prevalence Analysis`,
              style: { color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }
            }
          }
        };
      
      case 'scatter_plot':
        return {
          series: [{
            name: 'Patient Clusters',
            data: chartData.cluster_centers?.map((point: any, index: number) => ({
              x: point.x,
              y: point.y,
              z: point.size,
              name: `Cluster ${index + 1}`
            })) || [],
            color: '#8B5CF6'
          }],
          options: {
            ...commonOptions,
            ...commonStyling,
            chart: {
              ...commonOptions.chart,
              type: 'scatter',
              zoom: { enabled: false }
            },
            markers: {
              size: [6, 10, 14],
              colors: ['#EF4444', '#F59E0B', '#10B981'],
              strokeColors: '#ffffff',
              strokeWidth: 2
            },
            xaxis: {
              title: { 
                text: 'Average Patient Age (Years)',
                style: { color: '#ffffff', fontSize: '14px' }
              },
              labels: {
                style: { colors: '#9CA3AF', fontSize: '12px' }
              }
            },
            yaxis: {
              title: { 
                text: 'Average Survival Time (Days)',
                style: { color: '#ffffff', fontSize: '14px' }
              },
              labels: {
                style: { colors: '#9CA3AF', fontSize: '12px' }
              }
            },
            title: { 
              text: `${role.replace('_', ' ').toUpperCase()} - Patient Risk Group Analysis`,
              style: { color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }
            }
          }
        };
      
      case 'dashboard':
        return {
          series: [{
            name: 'Patient Volume',
            data: Object.values(chartData.performance_by_region || {}).map((region: any) => region.patients),
            color: '#F59E0B'
          }],
          options: {
            ...commonOptions,
            ...commonStyling,
            chart: {
              ...commonOptions.chart,
              type: 'bar'
            },
            plotOptions: {
              bar: {
                borderRadius: 8,
                columnWidth: '70%',
                distributed: true,
                colors: {
                  ranges: [{
                    from: 0,
                    to: 1000,
                    color: '#F59E0B'
                  }]
                }
              }
            },
            xaxis: {
              categories: Object.keys(chartData.performance_by_region || {}),
              title: { 
                text: 'Hospital Regions',
                style: { color: '#ffffff', fontSize: '14px' }
              },
              labels: {
                style: { colors: '#9CA3AF', fontSize: '12px' }
              }
            },
            yaxis: {
              title: { 
                text: 'Number of Patients',
                style: { color: '#ffffff', fontSize: '14px' }
              },
              labels: {
                style: { colors: '#9CA3AF', fontSize: '12px' }
              }
            },
            title: { 
              text: `${role.replace('_', ' ').toUpperCase()} - Hospital Performance Analysis`,
              style: { color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }
            }
          }
        };

      case 'outcome_analysis':
        return {
          series: [{
            name: 'Patient Outcomes',
            data: Object.values(chartData.outcome_distribution || {}),
            color: '#10B981'
          }],
          options: {
            ...commonOptions,
            ...commonStyling,
            chart: {
              ...commonOptions.chart,
              type: 'bar'
            },
            plotOptions: {
              bar: {
                borderRadius: 8,
                columnWidth: '60%',
                distributed: true,
                colors: ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
              }
            },
            xaxis: {
              categories: Object.keys(chartData.outcome_distribution || {}),
              title: { 
                text: 'Outcome Types',
                style: { color: '#ffffff', fontSize: '14px' }
              },
              labels: {
                style: { colors: '#9CA3AF', fontSize: '12px' }
              }
            },
            yaxis: {
              title: { 
                text: 'Number of Patients',
                style: { color: '#ffffff', fontSize: '14px' }
              },
              labels: {
                style: { colors: '#9CA3AF', fontSize: '12px' }
              }
            },
            title: { 
              text: `${role.replace('_', ' ').toUpperCase()} - Patient Outcomes Analysis`,
              style: { color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }
            }
          }
        };

      case 'mortality_trends':
        return {
          series: [
            {
              name: 'Mortality Rate (%)',
              data: chartData.mortality_rates || [],
              color: '#EF4444'
            },
            {
              name: 'Survival Rate (%)',
              data: chartData.survival_rates || [],
              color: '#10B981'
            }
          ],
          options: {
            ...commonOptions,
            ...commonStyling,
            chart: {
              ...commonOptions.chart,
              type: 'line'
            },
            stroke: {
              curve: 'smooth',
              width: 3
            },
            markers: {
              size: 5,
              strokeColors: '#ffffff',
              strokeWidth: 2
            },
            xaxis: {
              categories: chartData.time_periods || [],
              title: { 
                text: 'Time Period',
                style: { color: '#ffffff', fontSize: '14px' }
              },
              labels: {
                style: { colors: '#9CA3AF', fontSize: '12px' }
              }
            },
            yaxis: {
              title: { 
                text: 'Rate (%)',
                style: { color: '#ffffff', fontSize: '14px' }
              },
              min: 0,
              max: 100,
              labels: {
                style: { colors: '#9CA3AF', fontSize: '12px' },
                formatter: function(val: any) {
                  return val + '%'
                }
              }
            },
            title: { 
              text: `${role.replace('_', ' ').toUpperCase()} - Mortality Trends Analysis`,
              style: { color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }
            }
          }
        };

      case 'readmission_analysis':
        return {
          series: [{
            name: 'Readmission Rate (%)',
            data: Object.values(chartData.department_breakdown || {}),
            color: '#F59E0B'
          }],
          options: {
            ...commonOptions,
            ...commonStyling,
            chart: {
              ...commonOptions.chart,
              type: 'bar'
            },
            plotOptions: {
              bar: {
                borderRadius: 8,
                columnWidth: '60%',
                distributed: true,
                colors: ['#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#3B82F6']
              }
            },
            xaxis: {
              categories: Object.keys(chartData.department_breakdown || {}),
              title: { 
                text: 'Hospital Departments',
                style: { color: '#ffffff', fontSize: '14px' }
              },
              labels: {
                style: { colors: '#9CA3AF', fontSize: '12px' },
                rotate: -45,
                rotateAlways: false
              }
            },
            yaxis: {
              title: { 
                text: 'Readmission Rate (%)',
                style: { color: '#ffffff', fontSize: '14px' }
              },
              labels: {
                style: { colors: '#9CA3AF', fontSize: '12px' },
                formatter: function(val: any) {
                  return val + '%'
                }
              }
            },
            title: { 
              text: `${role.replace('_', ' ').toUpperCase()} - Readmission Rate Analysis`,
              style: { color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }
            }
          }
        };

      case 'cost_analysis':
        return {
          series: [{
            name: 'Cost Distribution (%)',
            data: Object.values(chartData.cost_breakdown || {}),
            color: '#8B5CF6'
          }],
          options: {
            ...commonOptions,
            ...commonStyling,
            chart: {
              ...commonOptions.chart,
              type: 'bar'
            },
            plotOptions: {
              bar: {
                borderRadius: 8,
                columnWidth: '60%',
                distributed: true,
                colors: ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6']
              }
            },
            xaxis: {
              categories: Object.keys(chartData.cost_breakdown || {}),
              title: { 
                text: 'Cost Categories',
                style: { color: '#ffffff', fontSize: '14px' }
              },
              labels: {
                style: { colors: '#9CA3AF', fontSize: '12px' },
                rotate: -45,
                rotateAlways: false
              }
            },
            yaxis: {
              title: { 
                text: 'Percentage of Total Cost (%)',
                style: { color: '#ffffff', fontSize: '14px' }
              },
              labels: {
                style: { colors: '#9CA3AF', fontSize: '12px' },
                formatter: function(val: any) {
                  return val + '%'
                }
              }
            },
            title: { 
              text: `${role.replace('_', ' ').toUpperCase()} - Healthcare Cost Analysis`,
              style: { color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }
            }
          }
        };

      case 'comprehensive_overview':
        return {
          series: [{
            name: 'Patient Count',
            data: Object.values(chartData.patient_demographics?.age_groups || {}),
            color: '#3B82F6'
          }],
          options: {
            ...commonOptions,
            ...commonStyling,
            chart: {
              ...commonOptions.chart,
              type: 'bar'
            },
            plotOptions: {
              bar: {
                borderRadius: 8,
                columnWidth: '60%',
                distributed: true,
                colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
              }
            },
            xaxis: {
              categories: Object.keys(chartData.patient_demographics?.age_groups || {}),
              title: { 
                text: 'Age Groups',
                style: { color: '#ffffff', fontSize: '14px' }
              },
              labels: {
                style: { colors: '#9CA3AF', fontSize: '12px' }
              }
            },
            yaxis: {
              title: { 
                text: 'Number of Patients',
                style: { color: '#ffffff', fontSize: '14px' }
              },
              labels: {
                style: { colors: '#9CA3AF', fontSize: '12px' }
              }
            },
            title: { 
              text: `${role.replace('_', ' ').toUpperCase()} - Patient Demographics Overview`,
              style: { color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }
            }
          }
        };

      // Ecommerce chart types
       case 'bar':
         return {
           series: [{
             name: chartData.datasets?.[0]?.label || 'Data',
             data: chartData.datasets?.[0]?.data || [],
             color: '#3B82F6'
           }],
           options: {
             ...commonOptions,
             ...commonStyling,
             chart: {
               ...commonOptions.chart,
               type: 'bar' as const
             },
             plotOptions: {
               bar: {
                 borderRadius: 8,
                 columnWidth: '60%',
                 distributed: true,
                 colors: {
                   ranges: [{
                     from: 0,
                     to: 1000,
                     color: '#3B82F6'
                   }]
                 }
               }
             },
             xaxis: {
               categories: chartData.labels || [],
               title: { 
                 text: 'Categories',
                 style: { color: '#ffffff', fontSize: '14px' }
               },
               labels: {
                 style: { colors: '#9CA3AF', fontSize: '12px' },
                 rotate: -45,
                 rotateAlways: false
               }
             },
             yaxis: {
               title: { 
                 text: 'Values',
                 style: { color: '#ffffff', fontSize: '14px' }
               },
               labels: {
                 style: { colors: '#9CA3AF', fontSize: '12px' }
               }
             },
             title: { 
               text: 'Ecommerce Analysis',
               style: { color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }
             }
           }
         };
       
       case 'line':
         return {
           series: [{
             name: chartData.datasets?.[0]?.label || 'Data',
             data: chartData.datasets?.[0]?.data || [],
             color: '#10B981'
           }],
           options: {
             ...commonOptions,
             ...commonStyling,
             chart: {
               ...commonOptions.chart,
               type: 'line' as const
             },
             stroke: {
               curve: 'smooth',
               width: 4
             },
             markers: {
               size: 6,
               colors: ['#10B981'],
               strokeColors: '#ffffff',
               strokeWidth: 2
             },
             xaxis: {
               categories: chartData.labels || [],
               title: { 
                 text: 'Time Period',
                 style: { color: '#ffffff', fontSize: '14px' }
               },
               labels: {
                 style: { colors: '#9CA3AF', fontSize: '12px' }
               }
             },
             yaxis: {
               title: { 
                 text: 'Values',
                 style: { color: '#ffffff', fontSize: '14px' }
               },
               labels: {
                 style: { colors: '#9CA3AF', fontSize: '12px' }
               }
             },
                         title: { 
              text: `${role.replace('_', ' ').toUpperCase()} - Ecommerce Analysis`,
              style: { color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }
            }
           }
         };
       
       default:
         return null;
     }
   };

  if (!data || (!data.line_data && !data.ohlc && !data.plot && !data.chart_type)) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-gray-400 bg-surface-light rounded-lg">
        No chart data available. Please run an analysis.
      </div>
    );
  }

  // Enhanced chart options with better interactivity and cleaner theme
  const commonOptions = {
    chart: {
      id: 'main-chart',
      type: currentChartType as 'line' | 'bar' | 'candlestick',
      height: chartHeight,
      background: '#1a1a2e',
      foreColor: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: true,
        },
        autoSelected: 'zoom' as const,
        export: {
          csv: {
            filename: `${currentChartType}-chart-data`,
            columnDelimiter: ',',
            headerCategory: 'Category',
            headerValue: 'Value',
          },
          png: {
            filename: `${currentChartType}-chart`,
          },
          svg: {
            filename: `${currentChartType}-chart`,
          },
        },
      },
      zoom: {
        enabled: false,
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 600,
        dynamicAnimation: {
          enabled: true,
          speed: 300,
        },
      },
      dropShadow: {
        enabled: true,
        color: '#000',
        top: 2,
        left: 2,
        blur: 4,
        opacity: 0.1,
      },
    },
    grid: {
      borderColor: '#E0E0E0',
      strokeDashArray: 2,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      theme: 'light',
      x: {
        format: 'dd MMM yyyy',
      },
      y: {
        formatter: (val: number) => `$${val ? val.toLocaleString() : '0'}`,
      },
      shared: true,
      intersect: false,
    },
    xaxis: {
      type: 'datetime' as const,
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
        rotate: -45,
        rotateAlways: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `$${val ? val.toLocaleString() : '0'}`,
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
      },
      title: {
        text: 'Value ($)',
        style: {
          color: '#6B7280',
          fontSize: '14px',
        },
      },
    },
    legend: {
      labels: {
        colors: '#374151',
        fontSize: '12px',
      },
      position: 'top' as const,
      horizontalAlign: 'left' as const,
      fontSize: '14px',
      fontWeight: 600,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: [3, 3, 2],
      dashArray: [0, 0, 5],
    },
    colors: ['#4F46E5', '#8B5CF6', '#FBBF24', '#10B981', '#EF4444'],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.1,
        gradientToColors: undefined,
        inverseColors: true,
        opacityFrom: 0.8,
        opacityTo: 0.2,
        stops: [0, 100],
      },
    },
  };

  // Chart type configurations
  const getChartConfig = () => {
    if (currentChartType === 'line' && data.line_data) {
      const seriesDataActual = data.line_data.map(d => ({
        x: new Date(d.date).getTime(),
        y: d.actual,
      }));
      const seriesDataPredicted = data.line_data
        .filter(d => d.predicted !== undefined)
        .map(d => ({
          x: new Date(d.date).getTime(),
          y: d.predicted!,
        }));

      let forecastSeries: any[] = [];
      if (showForecast && data.forecast && data.forecast.length > 0 && data.line_data.length > 0) {
        const lastDate = new Date(data.line_data[data.line_data.length - 1].date);
        const forecastPoints = data.forecast.map((val, index) => {
          let forecastDate = new Date(lastDate);
          forecastDate.setDate(lastDate.getDate() + (index + 1));
          return { x: forecastDate.getTime(), y: val };
        });
        forecastSeries = [{
          name: 'Forecast',
          data: forecastPoints,
          type: 'line',
        }];
      }

      return {
        series: [
          {
            name: 'Actual',
            data: seriesDataActual,
            type: 'line',
          },
          {
            name: 'Predicted',
            data: seriesDataPredicted,
            type: 'line',
          },
          ...forecastSeries,
        ],
        options: {
          ...commonOptions,
          chart: { ...commonOptions.chart, type: 'line' as const },
        },
      };
    }

    if (currentChartType === 'candlestick' && data.ohlc) {
      const seriesData = data.ohlc.map(d => ({
        x: new Date(d.date).getTime(),
        y: [d.open, d.high, d.low, d.close],
      }));

      return {
        series: [{
          name: 'OHLC',
          data: seriesData,
        }],
        options: {
          ...commonOptions,
          chart: { ...commonOptions.chart, type: 'candlestick' as const },
          plotOptions: {
            candlestick: {
              colors: {
                upward: '#10B981',
                downward: '#EF4444',
              },
            },
          },
        },
      };
    }

    if (currentChartType === 'bar' && data.ohlc) {
      const categories = data.ohlc.map(d => new Date(d.date).getTime());
      const seriesData = data.ohlc.map(d => d.close);

      return {
        series: [{
          name: 'Close Price',
          data: seriesData,
        }],
        options: {
          ...commonOptions,
          chart: { ...commonOptions.chart, type: 'bar' as const },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '70%',
              borderRadius: 4,
            },
          },
        },
      };
    }

    return null;
  };

  // Check if this is analysis data (healthcare or ecommerce)
  const analysisChart = renderAnalysisChart();
  const chartConfig = analysisChart || getChartConfig();

  const handleDownload = () => {
    const chart = document.querySelector('#main-chart') as any;
    if (chart && chart.chart) {
      chart.chart.exportToSVG();
    }
  };

  const handleZoomIn = () => {
    const chart = document.querySelector('#main-chart') as any;
    if (chart && chart.chart) {
      chart.chart.zoomX(0.5, 1);
    }
  };

  const handleZoomOut = () => {
    const chart = document.querySelector('#main-chart') as any;
    if (chart && chart.chart) {
      chart.chart.zoomX(1, 2);
    }
  };

  const handleReset = () => {
    const chart = document.querySelector('#main-chart') as any;
    if (chart && chart.chart) {
      chart.chart.resetSeries();
    }
  };

  if (data.plot) {
    return (
      <div className="w-full flex justify-center items-center">
        <img src={data.plot} alt="Prediction Chart" className="max-w-full h-auto" />
      </div>
    );
  }

  if (!chartConfig) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-gray-400 bg-surface-light rounded-lg">
        No data available for selected chart type.
      </div>
    );
  }

  return (
    <Card className="p-8 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50">
      {/* Chart Controls */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-white">Chart Visualization</h3>
            {data.rmse && (
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                RMSE: {data.rmse.toFixed(2)}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Chart Type Selector - Only show for non-analysis charts */}
            {!data.chart_type && (
              <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
                <Button
                  variant={currentChartType === 'line' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentChartType('line')}
                  className="px-3 py-1"
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Line
                </Button>
                <Button
                  variant={currentChartType === 'bar' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentChartType('bar')}
                  className="px-3 py-1"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Bar
                </Button>
                <Button
                  variant={currentChartType === 'candlestick' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentChartType('candlestick')}
                  className="px-3 py-1"
                >
                  <Activity className="w-4 h-4 mr-1" />
                  Candlestick
                </Button>
              </div>
            )}

            {/* Simplified Chart Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700"
                title="Reset Chart View"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white"
                title="Download Chart"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>

            {/* Height Controls */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Height:</span>
              <select
                value={chartHeight}
                onChange={(e) => setChartHeight(Number(e.target.value))}
                className="bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-600"
              >
                <option value={400}>Small</option>
                <option value={600}>Medium</option>
                <option value={800}>Large</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div 
        id={`chart-container-${role}`}
        className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700 shadow-2xl"
      >
        {/* Role-specific header */}
        <div className="mb-4 text-center">
          <h3 className="text-xl font-bold text-white capitalize">
            {role.replace('_', ' ')} Analytics Dashboard
          </h3>
          <p className="text-gray-400 text-sm">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>
        
        <ApexCharts
          options={chartConfig.options as ApexCharts.ApexOptions}
          series={
            Array.isArray(chartConfig.series) && chartConfig.series.length > 0 && typeof chartConfig.series[0] === 'object' && 'data' in chartConfig.series[0]
              ? chartConfig.series.map((s: any) => s.data)
              : chartConfig.series
          }
          type={data.chart_type === 'scatter_plot' ? 'scatter' : (data.chart_type ? (data.chart_type as 'line' | 'bar') : currentChartType)}
          height={chartHeight}
        />
      </div>

      {/* Chart Summary */}
      {data.summary && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Analysis Summary</h4>
          <p className="text-sm text-gray-400">{data.summary}</p>
        </div>
      )}

      {/* Healthcare Insights */}
      {data.insights && data.insights.length > 0 && (
        <div className="mt-6 p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl">
          <h4 className="text-lg font-semibold text-blue-200 mb-4 flex items-center">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
            Key Insights & Findings
          </h4>
          <div className="grid gap-3">
            {data.insights.map((insight, index) => (
              <div key={index} className="flex items-start p-3 bg-white/5 rounded-lg border border-white/10">
                <span className="text-blue-400 mr-3 mt-1 text-lg">•</span>
                <p className="text-blue-100 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};