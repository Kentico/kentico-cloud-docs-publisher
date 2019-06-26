const {
    eventComposer,
    publishEventsCreator,
} = require('./eventGridClient');

describe('eventComposer', () => {
    test('composes event with data of notification', async () => {
        const activityTitle = 'activity title';
        const text = 'notification text';
        const event = eventComposer(activityTitle, text);

        expect(event.id).toBeTruthy();
        expect(event.subject).toBeTruthy();
        expect(event.eventType).toBe('KenticoDocs.Notification.Created');
        expect(event.dataVersion).toBe('1.0');
        expect(event.data.activityTitle).toBe(activityTitle);
        expect(event.data.text).toBe(text);
        expect(event.data.mode).toBe('error');
        expect(event.eventTime).toBeTruthy();
    });
});

const eventGridClient = {
    publishEvents: jest.fn(),
};
const host = 'fake.url-to-webhook.cloud';
const fakeHost = `http://${host}/api/webhook`;
const events = [
    {
        data: { xxx: 'xxx' },
        dataVersion: '1.0',
        eventTime: new Date(),
        eventType: 'test_event',
        subject: 'test',
    },
];

describe('publishEvents', () => {
    test('calls publishEvents with correct host and events', async () => {
        const deps = {
            eventGridClient,
            host: fakeHost,
        };

        await publishEventsCreator(deps)(events);

        expect(eventGridClient.publishEvents.mock.calls[0][0]).toBe(host);
        expect(eventGridClient.publishEvents.mock.calls[0][1]).toBe(events);
    });
});
