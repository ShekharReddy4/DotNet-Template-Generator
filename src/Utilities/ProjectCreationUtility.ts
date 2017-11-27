'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';

import { ChildProcessUtility } from './ChildProcessUtility';
import { MessageUtility } from './MessageUtility';
import { StringUtility } from './StringUtility';

import { CLITypeEnum } from '../Enums/CLITypeEnum';
import { FrameworkTypeEnum } from '../Enums/FrameworkTypeEnum';
import { MessageTypeEnum } from '../Enums/MessageTypeEnum';

import { GenerateCmdDTO } from '../DTO/GenerateCmdDTO';

export class ProjectCreationUtility {

    public static GenerateApp(GenerateCmdObj: GenerateCmdDTO) {

        // Creates sln file if it doesn't exist.
        if (!GenerateCmdObj.IsSlnExists) {
            // Paths.
            GenerateCmdObj.SolutionPath = GenerateCmdObj.RootPath + "\\" + GenerateCmdObj.SlnName;
            GenerateCmdObj.ProjectPath = GenerateCmdObj.SolutionPath + '\\' + GenerateCmdObj.AppName;

            fs.mkdirSync(GenerateCmdObj.SolutionPath);

            // Creating sloution.
            ChildProcessUtility.RunChildProcess(CLITypeEnum.dotnet,
                ['new', 'sln', '--name', GenerateCmdObj.SlnName], GenerateCmdObj.SolutionPath);
            GenerateCmdObj.SlnName = GenerateCmdObj.SlnName + '.sln';
        }
        else {
            GenerateCmdObj.ProjectPath = GenerateCmdObj.SolutionPath + "\\" + GenerateCmdObj.AppName;
        }

        // Creating class library for dotnet core framework.
        if (GenerateCmdObj.FrameWork == FrameworkTypeEnum.NetCore && GenerateCmdObj.AppType == 'Classlib') {
            ChildProcessUtility.RunChildProcess(CLITypeEnum.dotnet,
                ['new', GenerateCmdObj.AppType, '-o', GenerateCmdObj.AppName, '-f', GenerateCmdObj.Version],
                GenerateCmdObj.SolutionPath);
        }
        else {
            // Application creator.
            ChildProcessUtility.RunChildProcess(CLITypeEnum.dotnet,
                ['new', GenerateCmdObj.AppType, '-o', GenerateCmdObj.AppName], GenerateCmdObj.SolutionPath);
        }

        let filepath: string = GenerateCmdObj.ProjectPath + '\\' + GenerateCmdObj.AppName + '.csproj';

        // Adding csproj to solution.
        var ref = ChildProcessUtility.RunChildProcess(CLITypeEnum.dotnet,
            ['sln', GenerateCmdObj.SlnName, 'add', filepath], GenerateCmdObj.SolutionPath);

        MessageUtility.ShowMessage(MessageTypeEnum.Info, `${GenerateCmdObj.AppName} created successfully`, []);

        ChildProcessUtility.RunChildProcess(CLITypeEnum.dotnet,
            ['clean'], GenerateCmdObj.ProjectPath);
    }
}