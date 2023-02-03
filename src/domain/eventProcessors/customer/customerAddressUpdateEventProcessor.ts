import { AbstractEvent } from '../abstractEvent';
import logger from '../../../utils/log';
import {
    CustomerAddressAddedMessage,
    CustomerAddressChangedMessage,
    CustomerAddressRemovedMessage,
} from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';
import { getCustomerProfile } from '../../ctService';
import {
    getCTCustomerAddressForKlaviyo,
    getPhoneNumber,
    mapCTAddressToKlaviyoLocation,
} from './utils/CustomerAddressUtils';

export class CustomerAddressUpdateEventProcessor extends AbstractEvent {
    isEventValid(): boolean {
        const message = this.ctMessage as unknown as
            | CustomerAddressAddedMessage
            | CustomerAddressRemovedMessage
            | CustomerAddressChangedMessage;
        return (
            message.resource.typeId === 'customer' &&
            ['CustomerAddressAdded', 'CustomerAddressRemoved', 'CustomerAddressChanged'].includes(message.type)
        );
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as
            | CustomerAddressAddedMessage
            | CustomerAddressRemovedMessage
            | CustomerAddressChangedMessage;
        logger.info(`processing CT ${message.type} message`);
        const customer = await getCustomerProfile(message.resource.id);
        if (!customer) {
            return [];
        }
        const address = getCTCustomerAddressForKlaviyo(customer);

        // if (JSON.stringify(address) !== JSON.stringify(message.address)) {
        const body: ProfileRequest = {
            data: {
                type: 'profile',
                attributes: {
                    phone_number: getPhoneNumber(address?.phone),
                    location: mapCTAddressToKlaviyoLocation(address),
                },
                meta: {
                    identifiers: {
                        external_id: message.resource.id,
                    },
                },
            },
        };
        return [
            {
                body: body,
                type: 'profileUpdated',
            },
        ];
    }
}
