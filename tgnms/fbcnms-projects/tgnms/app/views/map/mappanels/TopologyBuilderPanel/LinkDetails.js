/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

import * as React from 'react';
import AssetElementWrapper from '@fbcnms/tg-nms/app/views/map/mappanels/TopologyBuilderPanel/AssetElementWrapper';
import Button from '@material-ui/core/Button';
import LinkForm from '@fbcnms/tg-nms/app/views/map/mappanels/TopologyBuilderPanel/LinkForm';
import {STEP_TARGET} from '@fbcnms/tg-nms/app/components/tutorials/TutorialConstants';
import {makeStyles} from '@material-ui/styles';
import {useTopologyBuilderContext} from '@fbcnms/tg-nms/app/contexts/TopologyBuilderContext';
import {useTutorialContext} from '@fbcnms/tg-nms/app/contexts/TutorialContext';

const useStyles = makeStyles(() => ({
  addButton: {
    justifyContent: 'flex-start',
  },
}));

export default function LinkDetails() {
  const {
    updateTopology,
    newTopology,
    setNewTopology,
  } = useTopologyBuilderContext();
  const classes = useStyles();
  const {links} = newTopology;
  const {nextStep} = useTutorialContext();

  const handleAddLink = React.useCallback(() => {
    const newLinks = [...links, {}];
    updateTopology({links: newLinks});
    nextStep();
  }, [links, nextStep, updateTopology]);

  const handleClose = React.useCallback(
    index => {
      const newLinks = [...links];
      newLinks.splice(index, 1);
      setNewTopology({...newTopology, links: newLinks});
    },
    [links, newTopology, setNewTopology],
  );

  return (
    <>
      {links &&
        links.map((_, index) => (
          <AssetElementWrapper onClose={() => handleClose(index)}>
            <LinkForm index={index} />
          </AssetElementWrapper>
        ))}
      <Button
        color="primary"
        className={`${classes.addButton} ${STEP_TARGET.ADD_LINK}`}
        fullWidth
        onClick={handleAddLink}>
        + Add Link
      </Button>
    </>
  );
}
