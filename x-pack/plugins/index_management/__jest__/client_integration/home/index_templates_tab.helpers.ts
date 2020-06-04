/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ReactWrapper } from 'enzyme';
import { act } from 'react-dom/test-utils';

import {
  registerTestBed,
  TestBed,
  TestBedConfig,
  findTestSubject,
  nextTick,
} from '../../../../../test_utils';
// NOTE: We have to use the Home component instead of the TemplateList component because we depend
// upon react router to provide the name of the template to load in the detail panel.
import { IndexManagementHome } from '../../../public/application/sections/home'; // eslint-disable-line @kbn/eslint/no-restricted-paths
import { indexManagementStore } from '../../../public/application/store'; // eslint-disable-line @kbn/eslint/no-restricted-paths
import { TemplateDeserialized } from '../../../common';
import { WithAppDependencies, services, TestSubjects } from '../helpers';

const testBedConfig: TestBedConfig = {
  store: () => indexManagementStore(services as any),
  memoryRouter: {
    initialEntries: [`/indices`],
    componentRoutePath: `/:section(indices|templates)`,
  },
  doMountAsync: true,
};

const initTestBed = registerTestBed(WithAppDependencies(IndexManagementHome), testBedConfig);

export interface IndexTemplatesTabTestBed extends TestBed<TestSubjects> {
  findAction: (action: 'edit' | 'clone' | 'delete') => ReactWrapper;
  actions: {
    goToTemplatesList: () => void;
    selectDetailsTab: (tab: 'summary' | 'settings' | 'mappings' | 'aliases') => void;
    clickReloadButton: () => void;
    clickTemplateAction: (
      name: TemplateDeserialized['name'],
      action: 'edit' | 'clone' | 'delete'
    ) => void;
    clickTemplateAt: (index: number) => void;
    clickCloseDetailsButton: () => void;
    clickActionMenu: (name: TemplateDeserialized['name']) => void;
  };
}

export const setup = async (): Promise<IndexTemplatesTabTestBed> => {
  const testBed = await initTestBed();

  /**
   * Additional helpers
   */
  const findAction = (action: 'edit' | 'clone' | 'delete') => {
    const actions = ['edit', 'clone', 'delete'];
    const { component } = testBed;

    return component.find('.euiContextMenuItem').at(actions.indexOf(action));
  };

  /**
   * User Actions
   */

  const goToTemplatesList = () => {
    testBed.find('templatesTab').simulate('click');
  };

  const selectDetailsTab = (tab: 'summary' | 'settings' | 'mappings' | 'aliases') => {
    const tabs = ['summary', 'settings', 'mappings', 'aliases'];

    testBed.find('templateDetails.tab').at(tabs.indexOf(tab)).simulate('click');
  };

  const clickReloadButton = () => {
    const { find } = testBed;
    find('reloadButton').simulate('click');
  };

  const clickActionMenu = async (templateName: TemplateDeserialized['name']) => {
    const { component } = testBed;

    // When a table has > 2 actions, EUI displays an overflow menu with an id "<template_name>-actions"
    // The template name may contain a period (.) so we use bracket syntax for selector
    component.find(`div[id="${templateName}-actions"] button`).simulate('click');
  };

  const clickTemplateAction = (
    templateName: TemplateDeserialized['name'],
    action: 'edit' | 'clone' | 'delete'
  ) => {
    const actions = ['edit', 'clone', 'delete'];
    const { component } = testBed;

    clickActionMenu(templateName);

    component.find('.euiContextMenuItem').at(actions.indexOf(action)).simulate('click');
  };

  const clickTemplateAt = async (index: number) => {
    const { component, table, router } = testBed;
    const { rows } = table.getMetaData('templateTable');
    const templateLink = findTestSubject(rows[index].reactWrapper, 'templateDetailsLink');

    await act(async () => {
      const { href } = templateLink.props();
      router.navigateTo(href!);
      await nextTick();
      component.update();
    });
  };

  const clickCloseDetailsButton = () => {
    const { find } = testBed;

    find('closeDetailsButton').simulate('click');
  };

  return {
    ...testBed,
    findAction,
    actions: {
      goToTemplatesList,
      selectDetailsTab,
      clickReloadButton,
      clickTemplateAction,
      clickTemplateAt,
      clickCloseDetailsButton,
      clickActionMenu,
    },
  };
};
