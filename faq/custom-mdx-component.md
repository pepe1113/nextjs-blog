# 如何新增自訂 MDX 元件？

以下示範如何使用 Chart.js 建立圓環圖（假設已安裝所需套件），並在 MDX 文章中使用。首先，在 `components` 中建立 `DonutChart.tsx` 元件：

```tsx
'use client'

import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const DonutChart = ({ data }) => {
  return <Doughnut data={data} />
}

export default Doughnut
```

由於底層的 `Doughnut` 元件使用 React hooks，因此加入 `'use client'`，指定它是 Client Component。另外，目前有一個既有問題會導致 named component 無法使用，所以需要使用 default export。

接著，將元件加入 `MDXComponents.tsx`：

```diff
...
+ import DonutChart from './DonutChart'

export const components: MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
+  DonutChart,
  BlogNewsletterForm,
}
```

現在就可以在 `.mdx` 檔案中使用這個元件：

```mdx
## Example Donut Chart

export const data = {
  labels: ['Red', 'Blue', 'Yellow'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
      ],
      borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
      borderWidth: 1,
    },
  ],
}

<DonutChart data={data} />
```
