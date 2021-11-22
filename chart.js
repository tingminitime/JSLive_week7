export function C3_render(data) {

  let chart = c3.generate({
    size: {
      width: 160,
      height: 160
    },
    data: {
      columns: data,
      type: 'donut'
    },
    donut: {
      title: "套票地區比重",
      width: 12,
      label: {
        show: false,
        color: '#4B4B4B'
      }
    }
  });
}