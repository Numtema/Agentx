import { DocFolder } from './types';

export const documentationStructure: DocFolder = {
  name: 'docs',
  type: 'folder',
  description: 'Root folder for all project documentation.',
  children: [
    {
      name: 'README.md',
      type: 'file',
      description: 'The entry point for the documentation.',
      exampleContent: `<!-- AI: Generate a high-level README for the project. Include a brief overview, a link to the architecture overview, and a summary of the project's purpose. -->
# Project Documentation

Welcome! This is the central documentation repository for the project.

Select a file from the list on the left to view its contents.
`,
    },
    {
      name: 'analysis',
      type: 'folder',
      description: 'Contains documents related to understanding the problem and the business domain.',
      children: [
        {
          name: 'domain_model.md',
          type: 'file',
          description: 'Defines the key business concepts (entities) and their relationships.',
          exampleContent: `<!-- AI: Describe the main entities of the project, their key attributes, and how they relate to each other. For example: User, Product, Order. -->
# Domain Model
`,
        },
        {
          name: 'glossary.md',
          type: 'file',
          description: 'A list of definitions for key terms specific to the project.',
          exampleContent: `<!-- AI: Define any technical or business terms that are specific to this project to ensure everyone on the team has a shared understanding. -->
# Project Glossary
`,
        },
        {
          name: 'initial_research.md',
          type: 'file',
          description: 'A summary of preliminary studies or market analysis.',
          exampleContent: `<!-- AI: If the user provided any market research, competitor analysis, or initial findings, summarize them here. -->
# Initial Research Summary
`,
        },
      ],
    },
    {
      name: 'requirements',
      type: 'folder',
      description: 'Defines what the system must do.',
      children: [
        {
          name: 'functional_requirements.md',
          type: 'file',
          description: 'Details the specific behaviors and functions of the system.',
          exampleContent: `<!-- AI: List the key functional requirements based on the user's project description. Use a format like FR-1.1, FR-1.2. -->
# Functional Requirements
`,
        },
        {
          name: 'non_functional_requirements.md',
          type: 'file',
          description: 'Specifies the quality attributes like performance, security, etc.',
          exampleContent: `<!-- AI: List key non-functional requirements. Focus on performance (e.g., page load time), security (e.g., password hashing), and usability. -->
# Non-Functional Requirements
`,
        },
        {
          name: 'user_stories.md',
          type: 'file',
          description: 'Describes functionalities from an end-user perspective.',
          exampleContent: `<!-- AI: Create a few core user stories based on the project's main goals. Use the format: "As a [type of user], I want [an action] so that [a benefit]." and include acceptance criteria. -->
# User Stories
`,
        },
      ],
    },
    {
      name: 'design',
      type: 'folder',
      description: 'Contains technical design documents.',
      children: [
        {
          name: 'api_design.md',
          type: 'file',
          description: 'Specifications for the system\'s APIs (e.g., REST).',
          exampleContent: `<!-- AI: Design a basic REST API for the project. Specify key resources and endpoints (e.g., GET /users, POST /orders) and show example request/response JSON. -->
# API Design (REST)
`,
        },
        {
          name: 'database_schema.md',
          type: 'file',
          description: 'Describes the database structure.',
          exampleContent: `<!-- AI: Propose a database schema. List the main tables, their columns, data types, and primary/foreign key relationships. -->
# Database Schema
`,
        },
        {
            name: 'uml',
            type: 'folder',
            description: 'Contains UML diagrams for visual modeling.',
            children: [
                {
                  name: 'use_case_diagram.md',
                  type: 'file',
                  description: 'Visualizes the interactions between actors and use cases.',
                  exampleContent: `<!-- AI: Generate a Use Case diagram in Mermaid syntax. Identify the main actors (e.g., User, Admin) and the primary use cases. -->
# Use Case Diagram
`,
                },
                {
                  name: 'class_diagram.md',
                  type: 'file',
                  description: 'Represents the static structure of the system.',
                  exampleContent: `<!-- AI: Generate a Class Diagram in Mermaid syntax showing the core classes (from the domain model), their attributes, and relationships. -->
# Class Diagram
`,
                },
                {
                    name: 'sequence_diagrams',
                    type: 'folder',
                    description: 'Folder to hold multiple sequence diagrams.',
                    children: [
                       {
                          name: 'user_login_sequence.md',
                          type: 'file',
                          description: 'Shows the sequence of interactions for a user logging in.',
                          exampleContent: `<!-- AI: Generate a Sequence Diagram in Mermaid syntax for a critical flow, like a user login or placing an order. -->
# User Login Sequence Diagram
`,
                        }
                    ]
                },
            ]
        }
      ],
    },
    {
      name: 'architecture',
      type: 'folder',
      description: 'Documents describing the high-level structure.',
      children: [
        {
          name: 'architecture_overview.md',
          type: 'file',
          description: 'A high-level description of the chosen architectural style.',
          exampleContent: `<!-- AI: Propose a high-level architecture (e.g., 3-Tier, Microservices). Describe the main components and create a simple diagram in Mermaid syntax. -->
# Architecture Overview
`,
        },
        {
          name: 'decision_records',
          type: 'folder',
          description: 'A collection of Architectural Decision Records (ADRs).',
          children: [
            {
              name: 'adr_001_database_choice.md',
              type: 'file',
              description: 'An example ADR for choosing the primary database.',
              exampleContent: `<!-- AI: Write an Architectural Decision Record (ADR) for a key technology choice, like the primary database (e.g., PostgreSQL vs. MongoDB). Justify the decision. -->
# ADR-001: Choice of Primary Database
`,
            },
          ],
        },
      ],
    },
    {
      name: 'meetings',
      type: 'folder',
      description: 'A record of meeting notes.',
      children: [
        {
          name: '2024-01-01_project_kickoff.md',
          type: 'file',
          description: 'Example notes from a project kick-off meeting.',
          exampleContent: `<!-- AI: Create a sample meeting notes document for a project kickoff. Include attendees, agenda, and key decisions made. -->
# Project Kick-off Meeting Notes
`,
        },
      ],
    },
  ],
};