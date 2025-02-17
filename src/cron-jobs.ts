import * as cron from 'node-cron';

import { ProductService } from './product/product.service';

export function startCronJobs(productService: ProductService) {
  //'0 0 * * *'

  cron.schedule('1,2,4,5 * * * *', async () => {
    await productService.deleteExpiredProducts();
  });

  console.log('Cron Job');
}
