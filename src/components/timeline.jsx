import React from 'react';
import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineDot from '@material-ui/lab/TimelineDot';
import { Paper } from '@material-ui/core';

const paperstyle={
    padding: '8px 1px',
    textAlign:'center',
}

export default function Stages() {
    return (
        <Timeline align="alternate">
            <TimelineItem>
                <TimelineSeparator>
                    <TimelineDot color="primary" />
                    <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                <Paper elevation={3} style={paperstyle}>Step 1 : Write
                </Paper>
                </TimelineContent>
            </TimelineItem>
            <TimelineItem>
                <TimelineSeparator>
                    <TimelineDot color="primary" />
                    <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                <Paper elevation={3} style={paperstyle}>Step 2 : Draft
                </Paper>
                </TimelineContent>
            </TimelineItem>
            <TimelineItem>
                <TimelineSeparator>
                    <TimelineDot color="primary" />
                    <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                <Paper elevation={3} 
                       style={paperstyle}>Step 3 : Pending
                </Paper>
                </TimelineContent>
            </TimelineItem>
            <TimelineItem>
                <TimelineSeparator>
                    <TimelineDot />
                </TimelineSeparator>
                <TimelineContent>
                <Paper elevation={3} 
                       style={paperstyle}>Step 4 : Publish
                </Paper>
                </TimelineContent>
            </TimelineItem>
        </Timeline>
    );
}