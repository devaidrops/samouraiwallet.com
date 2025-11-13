export const generateSummaryChartOption = (rating) => {
  return {
    chart: {
      type: 'donut',
      width: '100%',
      height: 320,
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        customScale: 1,
        donut: {
          size: '73%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontFamily: '"Inter", Helvetica',
              fontWeight: 500,
              color: '#7a8399',
              offsetY: -25,
              formatter: function (val) {
                return val.length > 17 ? val.substring(0, 17) + '...' : val;
              }
            },
            value: {
              show: true,
              fontSize: '28px',
              fontFamily: '"Inter", Helvetica',
              fontWeight: 900,
              color: '#000',
              offsetY: -5,
              formatter: function (val) {
                return (Math.round(val * 100) / 100) + '%';
              }
            },
            total: {
              show: true,
              showAlways: false,
              label: 'Общая оценка',

              fontSize: '14px',
              fontFamily: '"Inter", Helvetica',
              fontWeight: 500,
              color: '#7a8399',
              formatter: function (w) {
                return `${rating.toFixed(1)}`;
              }
            }
          }
        },
        offsetY: 0,
      },
    },
    stroke: {
      width: 0,
    },
    colors: [
      '#0038d1',
      '#e5ecff',
    ],

    series: [3,1.2000000000000002],
    labels: ["\u041e\u0431\u0449\u0430\u044f \u043e\u0446\u0435\u043d\u043a\u0430", ""],
    legend: {
      show: false,
      position: 'right',
      fontSize: '14px',
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 500,
      formatter: function (label, opts) {
        return label + " - " + (Math.round(opts.w.globals.series[opts.seriesIndex] * 100) / 100) + '%';
      },
      width: 300,
      offsetY: 40,
      markers: {
        width: 14,
        height: 14,
        radius: 3,
      },
      itemMargin: {
        horizontal: 0,
        vertical: 0
      },
    },
    tooltip: {
      enabled: false,
    }
  }
}