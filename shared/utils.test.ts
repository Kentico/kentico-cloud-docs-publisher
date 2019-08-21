import {
    ContentItem,
    ContentItemSystemAttributes,
    ElementModels,
    Elements,
    ElementType,
    getParserAdapter,
    IContentItemConfig,
    IContentItemRawData,
    IContentItemSystemAttributes,
    richTextResolver,
} from 'kentico-cloud-delivery';

import { getRichtextChildrenCodenames, IInnerItemCodenames } from './utils';

const constructItemConfig = (): IContentItemConfig => ({});

const constructRawData = (): IContentItemRawData => ({
    elements: {}
});

const createContentItem = (
    elements: { [key: string]: ElementModels.IElement<any> },
    system: IContentItemSystemAttributes
): ContentItem => {
    const item = new ContentItem();
    item.system = new ContentItemSystemAttributes({
        codename: system.codename,
        id: system.id,
        language: system.language,
        lastModified: new Date(system.lastModified),
        name: system.name,
        sitemapLocations: [],
        type: system.type
    });
    item._raw = constructRawData();
    item._config = constructItemConfig();

    Object.assign(item, elements);

    return item;
};

const constructRichTextElement = (data: {
    propertyName: string;
    name: string;
    value: string;
}): Elements.RichTextElement =>
    new Elements.RichTextElement(
        {
            contentItemSystem: null as any,
            propertyName: data.propertyName,
            rawElement: {
                name: data.name,
                type: ElementType.RichText,
                value: data.value
            }
        },
        [],
        {
            images: [],
            links: [],
            resolveRichTextFunc: () => {
                return richTextResolver.resolveData('x', data.value, data.propertyName, {
                    enableAdvancedLogging: false,
                    getLinkedItem: codename => undefined,
                    images: [],
                    linkedItemWrapperClasses: [],
                    linkedItemWrapperTag: 'div',
                    links: [],
                    queryConfig: {},
                    richTextHtmlParser: getParserAdapter()
                });
            }
        }
    );

describe('getRichtextChildrenCodenames', () => {
    it('should return codenames of linked items and components in richtext', () => {
        const item: ContentItem = createContentItem(
            {
                rt: constructRichTextElement({
                    name: 'RT',
                    propertyName: 'rt',
                    value:
                        '<object ' +
                        'type="application/kenticocloud" ' +
                        'data-type="item" ' +
                        'data-rel="link" ' +
                        'data-codename="first_known_item">' +
                        '</object>\n' +
                        '<object ' +
                        'type="application/kenticocloud" ' +
                        'data-type="item" ' +
                        'data-rel="component" ' +
                        'data-codename="n270aa43a_0910_0193_cac2_00a2dc564224">' +
                        '</object>\n' +
                        '<p><br></p>' +
                        '<object ' +
                        'type="application/kenticocloud" ' +
                        'data-type="item" ' +
                        'data-rel="link" ' +
                        'data-codename="second_known_item">' +
                        '</object>'
                })
            },
            {
                codename: 'automatically_published',
                id: '51103ce0-a4f6-40f9-99f9-c6a99c8207ee',
                language: 'default',
                lastModified: new Date(),
                name: 'Automatically published',
                sitemapLocations: [],
                type: 'automat'
            }
        );

        const expectedCodenames: IInnerItemCodenames = {
            componentCodenames: ['n270aa43a_0910_0193_cac2_00a2dc564224'],
            linkedItemCodenames: ['first_known_item', 'second_known_item']
        };

        const result: IInnerItemCodenames = getRichtextChildrenCodenames(item);

        assertCodenames(result, expectedCodenames);
    });

    it('should return codenames of linked items and components and ignore unknown type in richtext', () => {
        const item: ContentItem = createContentItem(
            {
                rt: constructRichTextElement({
                    name: 'RT',
                    propertyName: 'rt',
                    value:
                        '<object ' +
                        'type="application/kenticocloud" ' +
                        'data-type="item" ' +
                        'data-rel="link" ' +
                        'data-codename="first_known_item">' +
                        '</object>\n' +
                        '<object ' +
                        'type="application/travis" ' +
                        'data-type="unknown" ' +
                        'data-rel="link" ' +
                        'data-codename="other_app_item">' +
                        '</object>\n' +
                        '<p><br></p>' +
                        '<object ' +
                        'type="application/kenticocloud" ' +
                        'data-type="item" ' +
                        'data-rel="component" ' +
                        'data-codename="n270aa43a_0910_0193_cac2_00a2dc564224">' +
                        '</object>\n' +
                        '<object ' +
                        'type="application/kenticocloud" ' +
                        'data-type="item" ' +
                        'data-rel="link" ' +
                        'data-codename="second_known_item">' +
                        '</object>'
                })
            },
            {
                codename: 'automatically_published',
                id: '51103ce0-a4f6-40f9-99f9-c6a99c8207ee',
                language: 'default',
                lastModified: new Date(),
                name: 'Automatically published',
                sitemapLocations: [],
                type: 'automat'
            }
        );

        const expectedCodenames = {
            componentCodenames: ['n270aa43a_0910_0193_cac2_00a2dc564224'],
            linkedItemCodenames: ['first_known_item', 'second_known_item']
        };

        const result: IInnerItemCodenames = getRichtextChildrenCodenames(item);

        assertCodenames(result, expectedCodenames);
    });

    it('should return codenames of linked items and components and ignore unknown data type in richtext', () => {
        const item: ContentItem = createContentItem(
            {
                rt: constructRichTextElement({
                    name: 'RT',
                    propertyName: 'rt',
                    value:
                        '<object ' +
                        'type="application/kenticocloud" ' +
                        'data-type="item" ' +
                        'data-rel="link" ' +
                        'data-codename="first_known_item">' +
                        '</object>\n' +
                        '<object ' +
                        'type="application/kenticocloud" ' +
                        'data-type="new_type" ' +
                        'data-rel="link" ' +
                        'data-codename="new_type_item">' +
                        '</object>\n' +
                        '<p><br></p>' +
                        '<object ' +
                        'type="application/kenticocloud" ' +
                        'data-type="item" ' +
                        'data-rel="link" ' +
                        'data-codename="second_known_item">' +
                        '</object>' +
                        '<object ' +
                        'type="application/kenticocloud" ' +
                        'data-type="item" ' +
                        'data-rel="component" ' +
                        'data-codename="third_known_item">' +
                        '</object>' +
                        '<object ' +
                        'type="application/kenticocloud" ' +
                        'data-type="new_type" ' +
                        'data-rel="component" ' +
                        'data-codename="another_new_item">' +
                        '</object>'
                })
            },
            {
                codename: 'automatically_published',
                id: '51103ce0-a4f6-40f9-99f9-c6a99c8207ee',
                language: 'default',
                lastModified: new Date(),
                name: 'Automatically published',
                sitemapLocations: [],
                type: 'automat'
            }
        );

        const expectedCodenames: IInnerItemCodenames = {
            componentCodenames: ['third_known_item'],
            linkedItemCodenames: ['first_known_item', 'second_known_item']
        };

        const result: IInnerItemCodenames = getRichtextChildrenCodenames(item);

        assertCodenames(result, expectedCodenames);
    });

    it('should return codenames of linked items and components in richtexts', () => {
        const item: ContentItem = createContentItem(
            {
                first_rt: constructRichTextElement({
                    name: 'First RT',
                    propertyName: 'first_rt',
                    value:
                        '<object ' +
                        'type="application/kenticocloud" ' +
                        'data-type="item" ' +
                        'data-rel="link" ' +
                        'data-codename="item_in_first_rich_text">' +
                        '</object>\n'
                }),
                second_rt: constructRichTextElement({
                    name: 'Second RT',
                    propertyName: 'second_rt',
                    value:
                        '<object ' +
                        'type="application/kenticocloud" ' +
                        'data-type="item" ' +
                        'data-rel="link" ' +
                        'data-codename="item_in_second_rich_text">' +
                        '</object>\n'
                }),
                third_rt: constructRichTextElement({
                    name: 'Third RT',
                    propertyName: 'third_rt',
                    value:
                        '<object ' +
                        'type="application/kenticocloud" ' +
                        'data-type="item" ' +
                        'data-rel="component" ' +
                        'data-codename="item_in_third_rich_text">' +
                        '</object>\n'
                })
            },
            {
                codename: 'automatically_published',
                id: '51103ce0-a4f6-40f9-99f9-c6a99c8207ee',
                language: 'default',
                lastModified: new Date(),
                name: 'Automatically published',
                sitemapLocations: [],
                type: 'automat'
            }
        );

        const expectedCodenames: IInnerItemCodenames = {
            componentCodenames: ['item_in_third_rich_text'],
            linkedItemCodenames: ['item_in_first_rich_text', 'item_in_second_rich_text']
        };

        const result: IInnerItemCodenames = getRichtextChildrenCodenames(item);

        assertCodenames(result, expectedCodenames);
    });
});

const assertCodenames = (actualCodenames: IInnerItemCodenames, expectedCodenames: IInnerItemCodenames) => {
    expect(actualCodenames.linkedItemCodenames.sort()).toEqual(expectedCodenames.linkedItemCodenames.sort());
    expect(actualCodenames.componentCodenames.sort()).toEqual(expectedCodenames.componentCodenames.sort());
};
