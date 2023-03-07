import { parentPort } from 'node:worker_threads';
import { OrdersSync } from '../../../../../domain/bulkSync/OrdersSync';
import { CTCustomObjectLockService } from '../../../../../domain/bulkSync/services/CTCustomObjectLockService';
import { KlaviyoSdkService } from '../../../../driven/klaviyo/KlaviyoSdkService';
import { getApiRoot } from '../../../../driven/commercetools/ctService';
import { DefaultOrderMapper } from '../../../../../domain/shared/mappers/DefaultOrderMapper';
import { DummyCurrencyService } from '../../../../../domain/shared/services/dummyCurrencyService';
import { DefaultCtOrderService } from '../../../../driven/commercetools/DefaultCtOrderService';

let ordersSync: OrdersSync;

const cancel = async () => {
	if (parentPort) {
		await releaseLock();
		parentPort.postMessage('cancelled');
	} else {
		await releaseLock();
		process.exit(0);
	}
};

const releaseLock = async () => {
	await ordersSync?.releaseLockExternally();
};

(async () => {
	ordersSync = new OrdersSync(
		new CTCustomObjectLockService(getApiRoot()),
		new DefaultOrderMapper(new DummyCurrencyService()),
		new KlaviyoSdkService(),
		new DefaultCtOrderService(getApiRoot()),
	);

	await ordersSync.syncAllOrders();
	process.exit(0);
})();

if (parentPort)
	parentPort.once('message', (message) => {
		if (message === 'cancel') return cancel();
	});
