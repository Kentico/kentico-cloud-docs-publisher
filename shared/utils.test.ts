import { ContentItem } from 'kentico-cloud-delivery';
import { getLinkedItemsCodenames } from './utils';

describe('getLinkedItemsCodenames', () => {
  it('should return codenames of linked items and ignore components in richtext', () => {
    const item: ContentItem = {
      elements: {
        rt: {
          name: 'RT',
          type: 'rich_text',
          value: '<object ' +
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
            '</object>',
        },
      },
      system: {
        codename: 'automatically_published',
        id: '51103ce0-a4f6-40f9-99f9-c6a99c8207ee',
        language: 'default',
        lastModified: new Date(),
        name: 'Automatically published',
        sitemapLocations: [],
        type: 'automat',
      },
    };
    const expectedCodenames = [
      'first_known_item',
      'second_known_item',
    ];

    const result = getLinkedItemsCodenames(item);

    expect(result.sort()).toEqual(expectedCodenames.sort());
  });

  it('should return codenames of linked items and ignore unknown type in richtext', () => {
    const item: ContentItem = {
      elements: {
        rt: {
          name: 'RT',
          type: 'rich_text',
          value: '<object ' +
            'type="application/kenticocloud" ' +
            'data-type="item" ' +
            'data-rel="link" ' +
            'data-codename="first_known_item">' +
            '</object>\n' +
            '<object ' +
            'type="application/travis" ' +
            'data-type="item" ' +
            'data-rel="link" ' +
            'data-codename="other_app_item">' +
            '</object>\n' +
            '<p><br></p>' +
            '<object ' +
            'type="application/kenticocloud" ' +
            'data-type="item" ' +
            'data-rel="link" ' +
            'data-codename="second_known_item">' +
            '</object>',
        },
      },
      system: {
        codename: 'automatically_published',
        id: '51103ce0-a4f6-40f9-99f9-c6a99c8207ee',
        language: 'default',
        lastModified: new Date(),
        name: 'Automatically published',
        sitemapLocations: [],
        type: 'automat',
      },
    };
    const expectedCodenames = [
      'first_known_item',
      'second_known_item',
    ];

    const result = getLinkedItemsCodenames(item);

    expect(result.sort()).toEqual(expectedCodenames.sort());
  });

  it('should return codenames of linked items and ignore unknown data type in richtext', () => {
    const item: ContentItem = {
      elements: {
        rt: {
          name: 'RT',
          type: 'rich_text',
          value: '<object ' +
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
            '</object>',
        },
      },
      system: {
        codename: 'automatically_published',
        id: '51103ce0-a4f6-40f9-99f9-c6a99c8207ee',
        language: 'default',
        lastModified: new Date(),
        name: 'Automatically published',
        sitemapLocations: [],
        type: 'automat',
      },
    };
    const expectedCodenames = [
      'first_known_item',
      'second_known_item',
    ];

    const result = getLinkedItemsCodenames(item);

    expect(result.sort()).toEqual(expectedCodenames.sort());
  });

  it('should return codenames of linked items in richtexts', () => {
    const item: ContentItem = {
      elements: {
        first_rt: {
          name: 'First RT',
          type: 'rich_text',
          value: '<object ' +
            'type="application/kenticocloud" ' +
            'data-type="item" ' +
            'data-rel="link" ' +
            'data-codename="item_in_first_rich_text">' +
            '</object>\n',
        },
        second_rt: {
          name: 'Second RT',
          type: 'rich_text',
          value: '<object ' +
            'type="application/kenticocloud" ' +
            'data-type="item" ' +
            'data-rel="link" ' +
            'data-codename="item_in_second_rich_text">' +
            '</object>\n',
        },
      },
      system: {
        codename: 'automatically_published',
        id: '51103ce0-a4f6-40f9-99f9-c6a99c8207ee',
        language: 'default',
        lastModified: new Date(),
        name: 'Automatically published',
        sitemapLocations: [],
        type: 'automat',
      },
    };
    const expectedCodenames = [
      'item_in_first_rich_text',
      'item_in_second_rich_text',
    ];

    const result = getLinkedItemsCodenames(item);

    expect(result.sort()).toEqual(expectedCodenames.sort());
  });
});
