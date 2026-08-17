import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { SimpleChatPanel } from './components/simple-chat-panel';
import { AgentChatPanel } from './components/agent-chat-panel';

@Component({
  selector: 'app-plexrag-page',
  imports: [MatTabsModule, SimpleChatPanel, AgentChatPanel],
  templateUrl: './plexrag-page.html',
  styleUrl: './plexrag-page.css'
})
export class PlexRagPage {}
