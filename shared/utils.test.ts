import { ContentItem } from 'kentico-cloud-delivery';
import {
  getRichtextChildrenCodenames,
  IInnerItemCodenames,
} from './utils';

describe('getRichtextChildrenCodenames', () => {
  it('should return codenames of linked items and components in richtext', () => {
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
    const expectedCodenames = {
      componentCodenames: [
        'n270aa43a_0910_0193_cac2_00a2dc564224',
      ],
      linkedItemCodenames: [
        'first_known_item',
        'second_known_item',
      ],
    };

    const result = getRichtextChildrenCodenames(item);

    assertCodenames(result, expectedCodenames);
  });

  it('should return codenames of linked items and components and ignore unknown type in richtext', () => {
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
            'data-rel="component" ' +
            'data-codename="n270aa43a_0910_0193_cac2_00a2dc564224">' +
            '</object>\n' +
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
    const expectedCodenames = {
      componentCodenames: [
        'n270aa43a_0910_0193_cac2_00a2dc564224',
      ],
      linkedItemCodenames: [
        'first_known_item',
        'second_known_item',
      ],
    };

    const result = getRichtextChildrenCodenames(item);

    assertCodenames(result, expectedCodenames);
  });

  it('should return codenames of linked items and components and ignore unknown data type in richtext', () => {
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
    const expectedCodenames = {
      componentCodenames: [
        'third_known_item',
      ],
      linkedItemCodenames: [
        'first_known_item',
        'second_known_item',
      ],
    };

    const result = getRichtextChildrenCodenames(item);

    assertCodenames(result, expectedCodenames);
  });

  it('should return codenames of linked items and components in richtexts', () => {
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
        third_rt: {
          name: 'Third RT',
          type: 'rich_text',
          value: '<object ' +
            'type="application/kenticocloud" ' +
            'data-type="item" ' +
            'data-rel="component" ' +
            'data-codename="item_in_third_rich_text">' +
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
    const expectedCodenames = {
      componentCodenames: [
        'item_in_third_rich_text',
      ],
      linkedItemCodenames: [
        'item_in_first_rich_text',
        'item_in_second_rich_text',
      ],
    };

    const result = getRichtextChildrenCodenames(item);

    assertCodenames(result, expectedCodenames);
  });
});

const assertCodenames = (actualCodenames: IInnerItemCodenames, expectedCodenames: IInnerItemCodenames) => {
  expect(actualCodenames.linkedItemCodenames.sort()).toEqual(expectedCodenames.linkedItemCodenames.sort());
  expect(actualCodenames.componentCodenames.sort()).toEqual(expectedCodenames.componentCodenames.sort());
};
