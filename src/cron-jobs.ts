import * as cron from 'node-cron';

import { ProductService } from './product/product.service';

export function startCronJobs(productService: ProductService) {
  // '*/30 * * * * *'

  cron.schedule('0 0 * * *', async () => {
    console.log('Cron job triggered...');
    await productService.deleteExpiredProducts();
  });

  console.log('Cron Job');
}
