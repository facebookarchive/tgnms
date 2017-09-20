import React from 'react';
import { render } from 'react-dom';
import Modal from 'react-modal';

import { prepareUpgrade} from '../../apiutils/upgradeAPIUtil.js';
// import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

const modalStyle = {
  content : {
    width                 : 'calc(100% - 40px)',
    maxWidth              : '1000px',
    display               : 'table',
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
}

export default class ModalPrepareUpgrade extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedNodes: [], // I don't think we'll keep a list of excluded nodes

      timeout: 180, // timeout for the entire prepare operation
      skipFailure: true,

      limit: 1, // limit per batch. max batch size is infinite if this is set to 0
      imageUrl: "test imageUrl",
      md5: "",

      // HTTP
      downloadAttempts: 1, // prepare only

      // TORRENT
      downloadTimeout: 180,
      downloadLimit: -1,
      uploadLimit: -1,
      maxConnections: -1,

      isHttp: true, // prepare only, this is used for internal state to let the user specify http or torrent properties
    }
  }

  // HTTP only
  submitPrepare() {
    // TODO: check state here for http or torrent
    // md5 for torrent

    const requestBody = {
      // ugType handled by the server endpoint
      nodes: this.state.selectedNodes,
      imageUrl: this.state.imageUrl,
      md5: this.state.md5,

      timeout: this.state.timeout,
      skipFailure: this.state.skipFailure,
      limit: this.state.limit,

      requestId: 'NMS' + new Date().getTime(),
      isHttp: this.state.isHttp
    };

    if (this.state.isHttp) {
      requestBody.downloadAttempts = this.state.downloadAttempts;
    } else {
      requestBody.torrentParams = {
        downloadTimeout: this.state.downloadTimeout,
        downloadLimit: this.state.downloadLimit,
        uploadLimit: this.state.uploadLimit,
        maxConnections: this.state.maxConnections
      }
    }

    console.log('submitting upgrade PREPARE request', requestBody);
    prepareUpgrade(requestBody);
    this.props.onClose();
  }

  modalClose() {
    this.props.onClose();
  }

  onChangeDownloadMode = (e) => {
    this.setState({isHttp: e.currentTarget.value === 'http'});
  }

  render() {
    /*
    Prepare modal:
      List nodes TODO
      Timeout
      SkipFailure?
      Batch size limit
      URL of image
      MD5 of image

      // HTTP ONLY
        Number of download attempts for image

      // TORRENT ONLY
        download timeout
        download limit
        upload limit
        maxConnections
    */
    return (
      <Modal
        style={modalStyle}
        isOpen={this.props.isOpen}
        onRequestClose={this.modalClose.bind(this)}
      >
        <div className="upgrade-modal-content">
          <div className="upgrade-modal-row">
            <label>Upgrade timeout (s):</label>
            <input type="number" value={this.state.timeout}
              onChange={(event) => this.setState({'timeout': event.target.value})}
            />
          </div>

          <div className="upgrade-modal-row">
            <label>Skip failures?</label>
            <input type="checkbox" value={this.state.skipFailure}
              onChange={(event) => this.setState({'skipFailure': event.target.checked})}
            />
          </div>

          <div className="upgrade-modal-row">
            <label>Batch size limit:</label>
            <input type="number" value={this.state.limit}
              onChange={(event) => this.setState({'limit': event.target.value})}
            />
          </div>

          <div className="upgrade-modal-row">
            <label>Url of upgrade image:</label>
            <input type="text" value={this.state.imageUrl}
              onChange={(event) => this.setState({'imageUrl': event.target.value})}
            />
          </div>

          <div className="upgrade-modal-row">
            <label>Md5 of upgrade image:</label>
            <input type="text" value={this.state.md5}
              onChange={(event) => this.setState({'md5': event.target.value})}
            />
          </div>

          <form> <label>Specify the mode to retrieve the image:</label>
            <div className="download-type-selector">
              <input type="radio" id="http" value="http" onChange={this.onChangeDownloadMode} checked={this.state.isHttp}/>
              <label for="http">Http</label>

              <input type="radio" name="torrent" value="torrent" onChange={this.onChangeDownloadMode} checked={!this.state.isHttp}/>
              <label for="torrent">Torrent</label>
            </div>
          </form>

          {this.state.isHttp &&
            <div className="upgrade-modal-row">
              <label>Download attempts for image:</label>
              <input type="number" value={this.state.downloadAttempts}
                onChange={(event) => this.setState({'downloadAttempts': event.target.value})}
              />
            </div>
          }

          {!this.state.isHttp &&
            <div>
              <div className="upgrade-modal-row">
                <label>Download timeout (torrent):</label>
                <input type="number" value={this.state.downloadTimeout}
                  onChange={(event) => this.setState({'downloadTimeout': event.target.value})}
                />
              </div>

              <div className="upgrade-modal-row">
                <label>Max download speed (-1 for unlimited):</label>
                <input type="number" value={this.state.downloadLimit}
                  onChange={(event) => this.setState({'downloadLimit': event.target.value})}
                />
              </div>

              <div className="upgrade-modal-row">
                <label>Max upload speed (-1 for unlimited):</label>
                <input type="number" value={this.state.uploadLimit}
                  onChange={(event) => this.setState({'uploadLimit': event.target.value})}
                />
              </div>

              <div className="upgrade-modal-row">
                <label>Max peer connections (-1 for unlimited):</label>
                <input type="number" value={this.state.maxConnections}
                  onChange={(event) => this.setState({'maxConnections': event.target.value})}
                />
              </div>
            </div>
          }

        </div>
        <div className="upgrade-modal-footer">
          <button className='upgrade-modal-btn' onClick={this.modalClose.bind(this)}>Close</button>
          <button className='upgrade-modal-btn' onClick={this.submitPrepare.bind(this)} style={{'backgroundColor': '#8b9dc3'}}>Submit</button>
        </div>
      </Modal>
    );
  }
}

ModalPrepareUpgrade.propTypes = {
  onClose: React.PropTypes.func.isRequired,


  // instance: React.PropTypes.object.isRequired,
  // routing: React.PropTypes.object.isRequired,
  // topology: React.PropTypes.object.isRequred,
}
